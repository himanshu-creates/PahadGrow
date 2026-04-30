import { Router } from 'express';
import { products, reviews, newId } from './data_store.js';
import { authMiddleware, requireRole } from './middleware_auth.js';

const router = Router();

// GET /api/products  — list with optional filters
router.get('/', (req, res) => {
  const { category, search, sellerId, status = 'active', page = 1, limit = 20 } = req.query;
  let result = products.filter(p => p.status === status);
  if (category && category !== 'all') result = result.filter(p => p.category === category);
  if (sellerId) result = result.filter(p => p.sellerId === sellerId);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  const total = result.length;
  const start = (Number(page) - 1) * Number(limit);
  result = result.slice(start, start + Number(limit));
  res.json({ success: true, products: result, total, page: Number(page), limit: Number(limit) });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const productReviews = reviews.filter(r => r.productId === product.id);
  res.json({ success: true, product, reviews: productReviews });
});

// POST /api/products  — seller only
router.post('/', authMiddleware, requireRole('seller', 'admin'), (req, res) => {
  const { name, category, price, originalPrice, unit, stock, images, description, location, tags } = req.body;
  if (!name || !category || !price) return res.status(400).json({ success: false, message: 'name, category, price required' });
  const seller = { sellerId: req.user.id, sellerName: req.user.name, sellerVillage: '' };
  const product = {
    id: newId(), ...seller, name, category,
    price: Number(price), originalPrice: Number(originalPrice || price),
    unit: unit || '', stock: Number(stock || 0), sold: 0,
    images: images || [], description: description || '',
    location: location || '', rating: 0, reviewCount: 0,
    tags: tags || [], status: 'active', createdAt: new Date().toISOString()
  };
  products.push(product);
  res.status(201).json({ success: true, product });
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, requireRole('seller', 'admin'), (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  if (req.user.role !== 'admin' && products[idx].sellerId !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not your product' });
  const allowed = ['name','category','price','originalPrice','unit','stock','images','description','location','tags','status'];
  allowed.forEach(key => { if (req.body[key] !== undefined) products[idx][key] = req.body[key]; });
  res.json({ success: true, product: products[idx] });
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, requireRole('seller', 'admin'), (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  if (req.user.role !== 'admin' && products[idx].sellerId !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not your product' });
  products.splice(idx, 1);
  res.json({ success: true, message: 'Deleted' });
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', authMiddleware, (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const { rating, comment } = req.body;
  if (!rating || !comment) return res.status(400).json({ success: false, message: 'rating and comment required' });
  const review = { id: newId(), productId: product.id, userId: req.user.id, userName: req.user.name, rating: Number(rating), comment, date: new Date().toISOString(), likes: 0 };
  reviews.push(review);
  // Recalculate rating
  const productReviews = reviews.filter(r => r.productId === product.id);
  product.rating = Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10) / 10;
  product.reviewCount = productReviews.length;
  res.status(201).json({ success: true, review });
});

export default router;
