import { Router } from 'express';
import { users, carts, wishlists, landListings, communityPosts, products, newId } from './data_store.js';
import { authMiddleware, requireRole } from './middleware_auth.js';

const router = Router();

// ─── USERS ────────────────────────────────────────────────────────────────────
// GET /api/users/profile
router.get('/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'Not found' });
  const { password: _, ...safe } = user;
  res.json({ success: true, user: safe });
});

// PUT /api/users/profile
router.put('/profile', authMiddleware, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  const allowed = ['name','phone','village','district','state','bio','avatar'];
  allowed.forEach(k => { if (req.body[k] !== undefined) users[idx][k] = req.body[k]; });
  const { password: _, ...safe } = users[idx];
  res.json({ success: true, user: safe });
});

// GET /api/users  (admin only)
router.get('/', authMiddleware, requireRole('admin'), (req, res) => {
  const safe = users.map(({ password: _, ...u }) => u);
  res.json({ success: true, users: safe, total: safe.length });
});

// ─── CART ─────────────────────────────────────────────────────────────────────
// GET /api/users/cart
router.get('/cart', authMiddleware, (req, res) => {
  const items = carts[req.user.id] || [];
  const enriched = items.map(item => {
    const p = products.find(p => p.id === item.productId);
    return { ...item, product: p || null };
  });
  res.json({ success: true, cart: enriched });
});

// POST /api/users/cart
router.post('/cart', authMiddleware, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!carts[req.user.id]) carts[req.user.id] = [];
  const existing = carts[req.user.id].find(i => i.productId === productId);
  if (existing) existing.quantity += Number(quantity);
  else carts[req.user.id].push({ productId, quantity: Number(quantity) });
  res.json({ success: true, cart: carts[req.user.id] });
});

// DELETE /api/users/cart/:productId
router.delete('/cart/:productId', authMiddleware, (req, res) => {
  carts[req.user.id] = (carts[req.user.id] || []).filter(i => i.productId !== req.params.productId);
  res.json({ success: true });
});

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
router.get('/wishlist', authMiddleware, (req, res) => {
  const ids = wishlists[req.user.id] || [];
  const items = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
  res.json({ success: true, wishlist: items });
});

router.post('/wishlist/:productId', authMiddleware, (req, res) => {
  if (!wishlists[req.user.id]) wishlists[req.user.id] = [];
  const id = req.params.productId;
  const idx = wishlists[req.user.id].indexOf(id);
  if (idx === -1) wishlists[req.user.id].push(id);
  else wishlists[req.user.id].splice(idx, 1);
  res.json({ success: true, wishlisted: idx === -1 });
});

// ─── LAND LISTINGS ────────────────────────────────────────────────────────────
router.get('/land', (req, res) => {
  const { district, search } = req.query;
  let result = landListings.filter(l => l.status === 'available');
  if (district && district !== 'All Districts') result = result.filter(l => l.district === district);
  if (search) result = result.filter(l => l.village.toLowerCase().includes(search.toLowerCase()) || l.district.toLowerCase().includes(search.toLowerCase()));
  res.json({ success: true, lands: result });
});

router.post('/land', authMiddleware, requireRole('seller', 'landowner', 'admin'), (req, res) => {
  const { village, district, area, price, image, suitableFor, water, electricity, description } = req.body;
  const listing = { id: newId(), ownerId: req.user.id, ownerName: req.user.name, village, district, area, price: Number(price), priceUnit: '/month', image: image || '', suitableFor: suitableFor || [], water: Boolean(water), electricity: Boolean(electricity), description: description || '', status: 'available', createdAt: new Date().toISOString() };
  landListings.push(listing);
  res.status(201).json({ success: true, listing });
});

// ─── COMMUNITY POSTS ──────────────────────────────────────────────────────────
router.get('/community', (req, res) => {
  res.json({ success: true, posts: communityPosts });
});

router.post('/community', authMiddleware, (req, res) => {
  const { question, content, tags } = req.body;
  if (!question || !content) return res.status(400).json({ success: false, message: 'question and content required' });
  const post = { id: newId(), authorId: req.user.id, authorName: req.user.name, question, content, likes: 0, replyCount: 0, tags: tags || [], createdAt: new Date().toISOString() };
  communityPosts.push(post);
  res.status(201).json({ success: true, post });
});

router.post('/community/:id/like', authMiddleware, (req, res) => {
  const post = communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Not found' });
  post.likes += 1;
  res.json({ success: true, likes: post.likes });
});

export default router;
