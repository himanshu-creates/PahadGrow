import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pahadgrow_secret_change_in_prod';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'pahadgrow_admin_secret_change_this';

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body?.email });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user.toObject();
    safeUser.id = safeUser._id;

    console.log('Login success for:', email);
    res.json({ success: true, token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// SECURITY: 'admin' role is NOT allowed through public signup.
// Only buyer, seller, landowner are valid public roles.
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', { email: req.body?.email, name: req.body?.name });

    const {
      name,
      email,
      password,
      phone = '',
      role = 'buyer',
      village = '',
      district = '',
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // SECURITY FIX: Admin role is BLOCKED in public registration.
    // 'admin' is silently converted to 'buyer' as a defense-in-depth measure.
    const publicRoles = ['buyer', 'seller', 'landowner'];
    const safeRole = publicRoles.includes(role) ? role : 'buyer';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: safeRole,
      phone,
      village,
      district,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user.toObject();
    safeUser.id = safeUser._id;

    console.log('Register success for:', email, 'role:', safeRole);
    res.status(201).json({ success: true, token, user: safeUser });

  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = user.toObject();
    userObj.id = userObj._id;

    res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

// ─── CREATE ADMIN (Protected by Secret Key) ───────────────────────────────────
// This is the ONLY legitimate way to create an admin account.
// Requires a secret key from .env: ADMIN_SECRET_KEY
// Usage: POST /api/auth/create-admin
//        Headers: x-admin-secret: <your secret key>
//        Body: { name, email, password }
router.post('/create-admin', async (req, res) => {
  try {
    const providedSecret = req.headers['x-admin-secret'];

    if (!providedSecret || providedSecret !== ADMIN_SECRET_KEY) {
      // Log unauthorized attempts
      console.warn('Unauthorized admin creation attempt from IP:', req.ip);
      return res.status(403).json({ success: false, message: 'Invalid admin secret key' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Admin password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      // If user exists, upgrade them to admin
      existing.role = 'admin';
      await existing.save();
      console.log('Upgraded existing user to admin:', email);
      const { password: _, ...safeUser } = existing.toObject();
      return res.json({ success: true, message: 'User upgraded to admin', user: { ...safeUser, id: safeUser._id } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin created successfully:', email);
    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ success: true, message: 'Admin account created', user: { ...safeUser, id: safeUser._id } });

  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
