import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pahadgrow_secret_change_in_prod';

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
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
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

    const validRoles = ['buyer', 'seller', 'landowner', 'admin'];
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: validRoles.includes(role) ? role : 'buyer',
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

    res.status(201).json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
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

export default router;
