import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';

import authRoutes       from './route_auth.js';
import productRoutes    from './route_products.js';
import orderRoutes      from './route_orders.js';
import userRoutes       from './route_users.js';
import adminRoutes      from './route_admin.js';
import uploadRoutes     from './route_upload.js';
import knowledgeRoutes  from './route_knowledge.js';
import newsletterRoutes from './route_newsletter.js';

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/knowledge',  knowledgeRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 PahadGrow backend running on http://localhost:${PORT}`);
  });
});
