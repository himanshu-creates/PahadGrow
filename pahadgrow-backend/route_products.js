import { Router } from 'express';
import { Product, Review } from './models.js';
import { authMiddleware } from './middleware_auth.js';

const router = Router();

// ─── GET ALL PRODUCTS ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, sellerId, page = 1, limit = 20 } = req.query;

    // Build filter — only apply status:active for public (non-seller-self) requests
    const filter = {};

    if (category) filter.category = category;

    // Handle sellerId=me: resolve to the authenticated user's ID
    if (sellerId) {
      if (sellerId === 'me') {
        // Need auth to resolve 'me' — run the middleware inline
        // We access req.user if already populated, otherwise authenticate first
        if (!req.user) {
          // Try to authenticate without hard-failing
          const authHeader = req.headers['authorization'];
          if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
              const jwt = await import('jsonwebtoken');
              const token = authHeader.split(' ')[1];
              const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
              req.user = decoded;
            } catch {
              return res.status(401).json({ success: false, message: 'Invalid token for sellerId=me' });
            }
          } else {
            return res.status(401).json({ success: false, message: 'Authentication required for sellerId=me' });
          }
        }
        // For own products: show ALL statuses (active + inactive + out_of_stock)
        filter.sellerId = req.user.id;
      } else {
        // Specific seller ID — show only active products (public view)
        filter.sellerId = sellerId;
        filter.status = 'active';
      }
    } else {
      // No sellerId filter — public listing, active only
      filter.status = 'active';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);

    const mapped = products.map(p => ({ ...p, id: p._id }));
    res.json({ success: true, products: mapped, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      product: { ...product, id: product._id },
      reviews: reviews.map(r => ({ ...r, id: r._id })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!['seller', 'landowner', 'admin'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Only sellers can add products' });

    const { name, category, price, originalPrice, unit, stock, description, location, tags, images } = req.body;

    if (!name || !category || !price)
      return res.status(400).json({ success: false, message: 'Name, category, and price required' });

    const product = await Product.create({
      sellerId: req.user.id,
      sellerName: req.user.name,
      sellerVillage: req.user.village || '',
      name, category,
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      unit: unit || 'kg',
      stock: Number(stock || 0),
      description: description || '',
      location: location || '',
      tags: tags || [],
      images: images?.length ? images : ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600'],
    });

    res.status(201).json({ success: true, product: { ...product.toObject(), id: product._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const allowed = ['name', 'category', 'price', 'originalPrice', 'unit', 'stock', 'description', 'location', 'tags', 'images', 'status'];
    allowed.forEach(field => { if (req.body[field] !== undefined) product[field] = req.body[field]; });

    await product.save();
    res.json({ success: true, product: { ...product.toObject(), id: product._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment)
      return res.status(400).json({ success: false, message: 'Rating and comment required' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const review = await Review.create({
      productId: req.params.id,
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
    });

    // Update product rating
    const allReviews = await Review.find({ productId: req.params.id });
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = allReviews.length;
    await product.save();

    res.status(201).json({ success: true, review: { ...review.toObject(), id: review._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
