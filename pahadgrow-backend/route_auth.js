import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users, newId } from './data_store.js';

const router = Router();
const JWT_SECRET = "secret123"; // baad me env me daal dena

// 🔑 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// 📝 REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: newId(),
      name,
      email,
      password: hashedPassword,
      role: 'buyer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      token,
      user: safeUser
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// 👤 GET CURRENT USER
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser
    });

  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

export default router;