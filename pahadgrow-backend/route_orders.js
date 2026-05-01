import { Router } from 'express';
import { Order, Product } from './models.js';
import { authMiddleware } from './middleware_auth.js';

const router = Router();

// ─── GET ORDERS ───────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'seller' || req.user.role === 'admin'
      ? { sellerId: req.user.id }
      : { buyerId: req.user.id };

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders: orders.map(o => ({ ...o, id: o._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, shippingAddress, paymentMethod = 'cod', paymentId = '' } = req.body;

    if (!productId || !quantity || !shippingAddress)
      return res.status(400).json({ success: false, message: 'productId, quantity, and shippingAddress required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.stock < quantity)
      return res.status(400).json({ success: false, message: 'Insufficient stock' });

    const amount = product.price * Number(quantity);

    const order = await Order.create({
      buyerId: req.user.id,
      sellerId: product.sellerId,
      productId,
      productName: product.name,
      quantity: Number(quantity),
      amount,
      shippingAddress,
      paymentMethod,
      paymentId,
    });

    // Reduce stock
    product.stock -= Number(quantity);
    product.sold += Number(quantity);
    await product.save();

    res.status(201).json({ success: true, order: { ...order.toObject(), id: order._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── UPDATE ORDER STATUS ──────────────────────────────────────────────────────
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.sellerId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    order.status = status;
    await order.save();

    res.json({ success: true, order: { ...order.toObject(), id: order._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
