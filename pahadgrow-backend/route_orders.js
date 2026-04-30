import { Router } from 'express';
import { orders, products, newId } from './data_store.js';
import { authMiddleware } from './middleware_auth.js';

const router = Router();

// GET /api/orders  — buyer sees own orders, seller sees orders for their products
router.get('/', authMiddleware, (req, res) => {
  let result;
  if (req.user.role === 'buyer') result = orders.filter(o => o.buyerId === req.user.id);
  else if (req.user.role === 'seller') result = orders.filter(o => o.sellerId === req.user.id);
  else result = orders; // admin sees all
  res.json({ success: true, orders: result });
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.user.role !== 'admin' && order.buyerId !== req.user.id && order.sellerId !== req.user.id)
    return res.status(403).json({ success: false, message: 'Access denied' });
  res.json({ success: true, order });
});

// POST /api/orders  — buyer places order
router.post('/', authMiddleware, (req, res) => {
  const { productId, quantity = 1, shippingAddress } = req.body;
  if (!productId || !shippingAddress)
    return res.status(400).json({ success: false, message: 'productId and shippingAddress required' });
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });
  product.stock -= quantity;
  product.sold += quantity;
  const order = {
    id: newId(), buyerId: req.user.id, sellerId: product.sellerId,
    productId, productName: product.name,
    quantity: Number(quantity), amount: product.price * Number(quantity),
    status: 'processing', shippingAddress,
    date: new Date().toISOString()
  };
  orders.push(order);
  res.status(201).json({ success: true, order });
});

// PUT /api/orders/:id/status  — seller/admin updates status
router.put('/:id/status', authMiddleware, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.user.role !== 'admin' && order.sellerId !== req.user.id)
    return res.status(403).json({ success: false, message: 'Access denied' });
  const valid = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(req.body.status))
    return res.status(400).json({ success: false, message: 'Invalid status' });
  order.status = req.body.status;
  res.json({ success: true, order });
});

export default router;
