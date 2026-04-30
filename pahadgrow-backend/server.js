import express from 'express';
import cors from 'cors';
import authRoutes from "./route_auth.js";
import productRoutes from './route_products.js';
import orderRoutes from './route_orders.js';
import userRoutes from './route_users.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});