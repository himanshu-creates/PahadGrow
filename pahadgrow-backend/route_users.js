import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, CartItem, Wishlist, Product, Land, CommunityPost } from './models.js';
import { authMiddleware } from './middleware_auth.js';

const router = Router();

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { ...user, id: user._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'village', 'district', 'state', 'bio', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password').lean();
    res.json({ success: true, user: { ...user, id: user._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET CART ─────────────────────────────────────────────────────────────────
router.get('/cart', authMiddleware, async (req, res) => {
  try {
    const items = await CartItem.find({ userId: req.user.id }).lean();
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), { ...p, id: p._id }]));

    const cart = items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      product: productMap[i.productId.toString()] || null,
    }));

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADD / UPDATE CART ────────────────────────────────────────────────────────
router.post('/cart', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required' });

    await CartItem.findOneAndUpdate(
      { userId: req.user.id, productId },
      { quantity: Number(quantity) },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── REMOVE FROM CART ─────────────────────────────────────────────────────────
router.delete('/cart/:productId', authMiddleware, async (req, res) => {
  try {
    await CartItem.findOneAndDelete({ userId: req.user.id, productId: req.params.productId });
    res.json({ success: true, message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CLEAR CART ───────────────────────────────────────────────────────────────
router.delete('/cart', authMiddleware, async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET WISHLIST ─────────────────────────────────────────────────────────────
router.get('/wishlist', authMiddleware, async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user.id }).lean();
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    res.json({ success: true, wishlist: products.map(p => ({ ...p, id: p._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TOGGLE WISHLIST ──────────────────────────────────────────────────────────
router.post('/wishlist/:productId', authMiddleware, async (req, res) => {
  try {
    const existing = await Wishlist.findOne({ userId: req.user.id, productId: req.params.productId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, wishlisted: false });
    }
    await Wishlist.create({ userId: req.user.id, productId: req.params.productId });
    res.json({ success: true, wishlisted: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET LAND LISTINGS ────────────────────────────────────────────────────────
// GET /api/users/land?district=xyz&search=abc
// Public route — no auth required
router.get('/land', async (req, res) => {
  try {
    const { district, search } = req.query;
    const filter = { status: 'available' };

    if (district) filter.district = district;

    if (search) {
      // When search is provided, remove the district from base filter
      // and merge it into $and so both filters apply simultaneously
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = {
        $or: [
          { village: searchRegex },
          { district: searchRegex },
          { description: searchRegex },
          { suitableFor: { $in: [new RegExp(search, 'i')] } },
        ],
      };

      if (district) {
        // Both district filter AND search
        filter.$and = [{ district }, searchConditions];
        delete filter.district;
      } else {
        Object.assign(filter, searchConditions);
      }
    }

    const lands = await Land.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, lands: lands.map(l => ({ ...l, id: l._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CREATE LAND LISTING ──────────────────────────────────────────────────────
// POST /api/users/land  (landowner role required)
router.post('/land', authMiddleware, async (req, res) => {
  try {
    // Only landowners (and admins) can create listings
    if (req.user.role !== 'landowner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only landowners can create land listings. Update your role in profile settings.',
      });
    }

    const {
      village, district, area, price, priceUnit,
      suitableFor, water, electricity, description, image,
    } = req.body;

    if (!village || !district || !area || !price) {
      return res.status(400).json({
        success: false,
        message: 'village, district, area, and price are required',
      });
    }

    const land = await Land.create({
      ownerId: req.user.id,
      ownerName: req.user.name,
      village: village.trim(),
      district: district.trim(),
      area: area.trim(),
      price: Number(price),
      priceUnit: priceUnit || '/month',
      suitableFor: Array.isArray(suitableFor) ? suitableFor : [],
      water: Boolean(water),
      electricity: Boolean(electricity),
      description: description?.trim() || '',
      image: image?.trim() || '',
      status: 'available',
    });

    res.status(201).json({ success: true, land: { ...land.toObject(), id: land._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── UPDATE LAND LISTING ──────────────────────────────────────────────────────
// PUT /api/users/land/:id  (owner only)
router.put('/land/:id', authMiddleware, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Only the owner or admin can update
    if (land.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised to update this listing' });
    }

    const allowed = [
      'village', 'district', 'area', 'price', 'priceUnit',
      'suitableFor', 'water', 'electricity', 'description', 'image', 'status',
    ];
    const updates = {};
    allowed.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.water !== undefined) updates.water = Boolean(updates.water);
    if (updates.electricity !== undefined) updates.electricity = Boolean(updates.electricity);

    const updated = await Land.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
    res.json({ success: true, land: { ...updated, id: updated._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE LAND LISTING ──────────────────────────────────────────────────────
// DELETE /api/users/land/:id  (owner only)
router.delete('/land/:id', authMiddleware, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Only the owner or admin can delete
    if (land.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this listing' });
    }

    await land.deleteOne();
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET COMMUNITY POSTS ──────────────────────────────────────────────────────
router.get('/community', async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, posts: posts.map(p => ({ ...p, id: p._id, createdAt: p.createdAt })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CREATE COMMUNITY POST ────────────────────────────────────────────────────
router.post('/community', authMiddleware, async (req, res) => {
  try {
    const { question, content, tags = [] } = req.body;
    if (!question || !content)
      return res.status(400).json({ success: false, message: 'Question and content required' });

    const post = await CommunityPost.create({
      authorId: req.user.id,
      authorName: req.user.name,
      question, content, tags,
    });

    res.status(201).json({ success: true, post: { ...post.toObject(), id: post._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── LIKE POST ────────────────────────────────────────────────────────────────
router.post('/community/:postId/like', authMiddleware, async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, likes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
