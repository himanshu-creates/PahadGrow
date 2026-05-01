import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRoutes from './route_auth.js';
import productRoutes from './route_products.js';
import orderRoutes from './route_orders.js';
import userRoutes from './route_users.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Connect DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 PahadGrow backend running on http://localhost:${PORT}`);
  });
});
