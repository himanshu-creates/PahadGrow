import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, Product, Order, Land, CommunityPost, Review } from './models.js';
import { authMiddleware, adminMiddleware } from './middleware_auth.js';

const router = Router();

// Apply auth + admin middleware to ALL routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// ─── STATS ────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalLandowners,
      totalAdmins,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalLands,
      totalPosts,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'landowner' }),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'delivered' }),
      Land.countDocuments(),
      CommunityPost.countDocuments(),
      Review.countDocuments(),
    ]);

    // Total revenue from delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly user signups (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent users (last 5)
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, landowners: totalLandowners, admins: totalAdmins },
        products: { total: totalProducts, active: activeProducts },
        orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
        lands: { total: totalLands },
        community: { posts: totalPosts, reviews: totalReviews },
        revenue: { total: totalRevenue },
        monthlySignups,
        recentUsers: recentUsers.map(u => ({ ...u, id: u._id })),
        recentOrders: recentOrders.map(o => ({ ...o, id: o._id })),
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

// GET /api/admin/users
// Query: ?page=1&limit=20&role=buyer&search=name
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users: users.map(u => ({ ...u, id: u._id })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get user's products and orders count
    const [productsCount, ordersCount] = await Promise.all([
      Product.countDocuments({ sellerId: req.params.id }),
      Order.countDocuments({ $or: [{ buyerId: req.params.id }, { sellerId: req.params.id }] }),
    ]);

    res.json({ success: true, user: { ...user, id: user._id, productsCount, ordersCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent deleting other admins (safety measure)
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete another admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/users/:id/role
// Body: { role: 'buyer' | 'seller' | 'landowner' | 'admin' }
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['buyer', 'seller', 'landowner', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be buyer, seller, landowner, or admin' });
    }

    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot remove your own admin role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password').lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `Role updated to ${role}`, user: { ...user, id: user._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PRODUCT MANAGEMENT ───────────────────────────────────────────────────────

// GET /api/admin/products
// Query: ?page=1&limit=20&status=active&search=name
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sellerId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (sellerId) filter.sellerId = sellerId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products: products.map(p => ({ ...p, id: p._id })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/products/:id/status
// Body: { status: 'active' | 'inactive' | 'sold_out' }
router.patch('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'sold_out'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean();

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: `Product status updated to ${status}`, product: { ...product, id: product._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Also delete associated reviews
    await Review.deleteMany({ productId: req.params.id });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ORDER MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders: orders.map(o => ({ ...o, id: o._id })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order status updated', order: { ...order, id: order._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── LAND MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/lands
router.get('/lands', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [lands, total] = await Promise.all([
      Land.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Land.countDocuments(),
    ]);

    res.json({
      success: true,
      lands: lands.map(l => ({ ...l, id: l._id })),
      total,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/lands/:id
router.delete('/lands/:id', async (req, res) => {
  try {
    const land = await Land.findByIdAndDelete(req.params.id);
    if (!land) return res.status(404).json({ success: false, message: 'Land listing not found' });
    res.json({ success: true, message: 'Land listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
