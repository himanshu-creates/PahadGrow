import jwt from 'jsonwebtoken';
import { User } from './models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pahadgrow_secret_change_in_prod';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user)
      return res.status(401).json({ success: false, message: 'User not found' });

    req.user = { ...user, id: user._id.toString() };
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
