import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models.js';

await mongoose.connect(process.env.MONGODB_URI);
const hash = await bcrypt.hash('admin1234', 10);
await User.findOneAndUpdate(
  { email: 'admin@pahadgrow.com' },
  { password: hash, role: 'admin' }
);
console.log('Password updated!');
process.exit(0);