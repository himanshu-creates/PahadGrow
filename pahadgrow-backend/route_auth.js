import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { User } from './models.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pahadgrow_secret_change_in_prod';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'pahadgrow_admin_secret_change_this';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Nodemailer transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Helper: send OTP email (non-throwing — logs on failure)
async function sendOTPEmail(toEmail, otp) {
  try {
    await transporter.sendMail({
      from: `"PahadGrow" <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: 'PahadGrow — Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #166534; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">PahadGrow</h1>
            <p style="color: #bbf7d0; margin: 4px 0 0; font-size: 12px;">CULTIVATING GROWTH FROM THE HILLS</p>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; margin: 0 0 8px;">Password Reset OTP</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">Use this OTP to reset your password. Valid for 10 minutes.</p>
            <div style="background: white; border: 2px dashed #166534; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 40px; font-weight: bold; color: #166534; letter-spacing: 12px;">${otp}</span>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">If you didn't request this, ignore this email. Your password won't change.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('[SMTP] Failed to send OTP email:', err.message);
    return false;
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user.toObject();
    safeUser.id = safeUser._id;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('[LOGIN]', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token required' });
    }

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('[GOOGLE-AUTH] Token verification failed:', verifyErr.message);
      return res.status(401).json({ success: false, message: 'Invalid Google token. Please try again.' });
    }

    const { name, email, picture: avatar, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google account' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find existing user or create new one
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // New user — generate random password (they can reset later via forgot-password)
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        password: hashedPassword,
        role: 'buyer',
        avatar: avatar || '',
        googleId: googleId || '',
      });

      console.log('[GOOGLE-AUTH] New user created:', normalizedEmail);
    } else {
      // Update avatar if they did not have one
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
      console.log('[GOOGLE-AUTH] Existing user logged in:', normalizedEmail);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user.toObject();
    safeUser.id = safeUser._id;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('[GOOGLE-AUTH]', err);
    res.status(500).json({ success: false, message: 'Server error during Google login' });
  }
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone = '', role = 'buyer', village = '', district = '' } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const publicRoles = ['buyer', 'seller', 'landowner'];
    const safeRole = publicRoles.includes(role) ? role : 'buyer';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(), email: email.toLowerCase().trim(),
      password: hashedPassword, role: safeRole, phone, village, district,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user.toObject();
    safeUser.id = safeUser._id;
    res.status(201).json({ success: true, token, user: safeUser });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: 'Email already registered' });
    console.error('[REGISTER]', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const userObj = user.toObject();
    userObj.id = userObj._id;
    res.json({ success: true, user: userObj });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

// ─── SEND OTP (alias route) ───────────────────────────────────────────────────
router.post('/send-otp', handleSendOTP);

// ─── FORGOT PASSWORD — Send OTP ───────────────────────────────────────────────
router.post('/forgot-password', handleSendOTP);

async function handleSendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    const emailSent = await sendOTPEmail(normalizedEmail, otp);

    if (!emailSent) {
      console.log(`[DEV] OTP for ${normalizedEmail}: ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? 'OTP sent to your email'
        : 'OTP generated (email delivery failed — check server logs)',
    });

  } catch (err) {
    console.error('[SEND-OTP]', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
}

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.resetOTP || user.resetOTP !== String(otp).trim())
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    if (!user.resetOTPExpiry || user.resetOTPExpiry < new Date())
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });

    const resetToken = jwt.sign(
      { id: user._id, purpose: 'reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ success: true, resetToken });
  } catch (err) {
    console.error('[VERIFY-OTP]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword)
      return res.status(400).json({ success: false, message: 'Token and new password required' });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(400).json({ success: false, message: 'Reset token expired or invalid. Start again.' });
    }

    if (decoded.purpose !== 'reset')
      return res.status(400).json({ success: false, message: 'Invalid reset token' });

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = '';
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('[RESET-PASSWORD]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── CREATE ADMIN ─────────────────────────────────────────────────────────────
router.post('/create-admin', async (req, res) => {
  try {
    const providedSecret = req.headers['x-admin-secret'];
    if (!providedSecret || providedSecret !== ADMIN_SECRET_KEY)
      return res.status(403).json({ success: false, message: 'Invalid admin secret key' });

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Admin password must be at least 8 characters' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      const { password: _, ...safeUser } = existing.toObject();
      return res.json({ success: true, message: 'User upgraded to admin', user: { ...safeUser, id: safeUser._id } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(), email: email.toLowerCase().trim(),
      password: hashedPassword, role: 'admin',
    });

    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ success: true, message: 'Admin account created', user: { ...safeUser, id: safeUser._id } });
  } catch (err) {
    console.error('[CREATE-ADMIN]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
