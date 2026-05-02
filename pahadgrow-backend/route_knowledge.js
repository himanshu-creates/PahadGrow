import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authMiddleware } from './middleware_auth.js';
import mongoose from 'mongoose';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Cloudinary storage for videos ───────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'pahadgrow/knowledge/videos',
    resource_type:    'video',
    allowed_formats:  ['mp4', 'mov', 'webm', 'avi'],
    transformation:   [{ quality: 'auto' }],
  },
});

// ─── Cloudinary storage for thumbnails ───────────────────────────────────────
const thumbStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'pahadgrow/knowledge/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 800, height: 450, crop: 'fill', quality: 'auto' }],
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits:  { fileSize: 200 * 1024 * 1024 }, // 200 MB max
});

const uploadThumb = multer({
  storage: thumbStorage,
  limits:  { fileSize: 5 * 1024 * 1024 },
});

// ─── Inline models (add to models.js in production) ──────────────────────────
const knowledgeVideoSchema = new mongoose.Schema({
  authorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName:  { type: String, required: true },
  authorRole:  { type: String, default: 'Farmer' },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category:    { type: String, required: true },
  level:       { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  videoUrl:    { type: String, required: true },
  thumbnailUrl:{ type: String, default: '' },
  duration:    { type: String, default: '' },
  isPaid:      { type: Boolean, default: false },
  price:       { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const knowledgeCommentSchema = new mongoose.Schema({
  videoId:    { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeVideo', required: true },
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  text:       { type: String, required: true },
  likes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const knowledgePurchaseSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId:   { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeVideo', required: true },
  amount:    { type: Number, required: true },
  paymentId: { type: String, default: '' },
  method:    { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
}, { timestamps: true });
knowledgePurchaseSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const KnowledgeVideo    = mongoose.models.KnowledgeVideo    || mongoose.model('KnowledgeVideo', knowledgeVideoSchema);
const KnowledgeComment  = mongoose.models.KnowledgeComment  || mongoose.model('KnowledgeComment', knowledgeCommentSchema);
const KnowledgePurchase = mongoose.models.KnowledgePurchase || mongoose.model('KnowledgePurchase', knowledgePurchaseSchema);

// ─── UPLOAD VIDEO FILE ────────────────────────────────────────────────────────
// POST /api/knowledge/upload/video
router.post('/upload/video', authMiddleware, uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });
    res.json({
      success:   true,
      url:       req.file.path,
      public_id: req.file.filename,
      duration:  req.file.duration || '',
    });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ success: false, message: 'Video upload failed' });
  }
});

// ─── UPLOAD THUMBNAIL ─────────────────────────────────────────────────────────
// POST /api/knowledge/upload/thumbnail
router.post('/upload/thumbnail', authMiddleware, uploadThumb.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No thumbnail provided' });
    res.json({ success: true, url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error('Thumbnail upload error:', err);
    res.status(500).json({ success: false, message: 'Thumbnail upload failed' });
  }
});

// ─── GET ALL VIDEOS (public list) ────────────────────────────────────────────
// GET /api/knowledge?category=&search=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { authorName:  { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category:    { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [videos, total] = await Promise.all([
      KnowledgeVideo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      KnowledgeVideo.countDocuments(filter),
    ]);

    // Strip videoUrl from paid videos for non-authenticated / non-purchased users
    // (actual check done in single-video endpoint)
    const safeVideos = videos.map(v => ({
      ...v.toObject(),
      videoUrl: undefined,   // never send video URL in list
      likeCount: v.likes.length,
    }));

    res.json({ success: true, videos: safeVideos, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET SINGLE VIDEO (with access check) ────────────────────────────────────
// GET /api/knowledge/:id
router.get('/:id', async (req, res) => {
  try {
    const video = await KnowledgeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    // Increment view count
    await KnowledgeVideo.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Check if paid
    let hasAccess = !video.isPaid;

    if (video.isPaid) {
      // Check auth header
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const jwt = await import('jsonwebtoken');
          const token = authHeader.split(' ')[1];
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
          // Check if user is author (always has access) or has purchased
          if (String(video.authorId) === String(decoded.id)) {
            hasAccess = true;
          } else {
            const purchase = await KnowledgePurchase.findOne({ userId: decoded.id, videoId: video._id });
            hasAccess = !!purchase;
          }
        } catch { /* invalid token */ }
      }
    }

    res.json({
      success: true,
      video: {
        ...video.toObject(),
        videoUrl:  hasAccess ? video.videoUrl : null,
        hasAccess,
        likeCount: video.likes.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CREATE VIDEO ─────────────────────────────────────────────────────────────
// POST /api/knowledge
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, level, videoUrl, thumbnailUrl, duration, isPaid, price, authorRole } = req.body;
    if (!title || !category || !videoUrl) {
      return res.status(400).json({ success: false, message: 'title, category and videoUrl are required' });
    }
    const video = await KnowledgeVideo.create({
      authorId:    req.user.id,
      authorName:  req.user.name,
      authorRole:  authorRole || 'Farmer',
      title,
      description,
      category,
      level:       level || 'Beginner',
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      duration:    duration || '',
      isPaid:      !!isPaid,
      price:       isPaid ? Number(price) || 0 : 0,
    });
    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE VIDEO (own only) ──────────────────────────────────────────────────
// DELETE /api/knowledge/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const video = await KnowledgeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(video.authorId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await video.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── LIKE / UNLIKE VIDEO ──────────────────────────────────────────────────────
// POST /api/knowledge/:id/like
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const video = await KnowledgeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Not found' });
    const uid = req.user.id;
    const alreadyLiked = video.likes.some(l => String(l) === String(uid));
    if (alreadyLiked) {
      video.likes = video.likes.filter(l => String(l) !== String(uid));
    } else {
      video.likes.push(uid);
    }
    await video.save();
    res.json({ success: true, likeCount: video.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET COMMENTS ─────────────────────────────────────────────────────────────
// GET /api/knowledge/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await KnowledgeComment.find({ videoId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, comments: comments.map(c => ({ ...c.toObject(), likeCount: c.likes.length })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADD COMMENT ──────────────────────────────────────────────────────────────
// POST /api/knowledge/:id/comments
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Comment text required' });
    const comment = await KnowledgeComment.create({
      videoId:    req.params.id,
      authorId:   req.user.id,
      authorName: req.user.name,
      text:       text.trim(),
    });
    res.status(201).json({ success: true, comment: { ...comment.toObject(), likeCount: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── LIKE COMMENT ─────────────────────────────────────────────────────────────
// POST /api/knowledge/comments/:commentId/like
router.post('/comments/:commentId/like', authMiddleware, async (req, res) => {
  try {
    const comment = await KnowledgeComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    const uid = req.user.id;
    const alreadyLiked = comment.likes.some(l => String(l) === String(uid));
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(l => String(l) !== String(uid));
    } else {
      comment.likes.push(uid);
    }
    await comment.save();
    res.json({ success: true, likeCount: comment.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PURCHASE / UNLOCK VIDEO ──────────────────────────────────────────────────
// POST /api/knowledge/:id/purchase
// Body: { paymentId, method }
router.post('/:id/purchase', authMiddleware, async (req, res) => {
  try {
    const video = await KnowledgeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (!video.isPaid) return res.status(400).json({ success: false, message: 'This video is free' });

    const { paymentId = '', method = 'razorpay' } = req.body;

    // In production: verify Razorpay signature here before saving
    // const isValid = verifyRazorpaySignature(paymentId, orderId, signature);

    const purchase = await KnowledgePurchase.findOneAndUpdate(
      { userId: req.user.id, videoId: video._id },
      { amount: video.price, paymentId, method },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Video unlocked!', purchase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CHECK IF USER HAS PURCHASED ──────────────────────────────────────────────
// GET /api/knowledge/:id/access
router.get('/:id/access', authMiddleware, async (req, res) => {
  try {
    const video = await KnowledgeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false });
    if (!video.isPaid) return res.json({ success: true, hasAccess: true });
    if (String(video.authorId) === String(req.user.id)) return res.json({ success: true, hasAccess: true });
    const purchase = await KnowledgePurchase.findOne({ userId: req.user.id, videoId: video._id });
    res.json({ success: true, hasAccess: !!purchase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── MY UPLOADED VIDEOS ───────────────────────────────────────────────────────
// GET /api/knowledge/my/videos
router.get('/my/videos', authMiddleware, async (req, res) => {
  try {
    const videos = await KnowledgeVideo.find({ authorId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, videos: videos.map(v => ({ ...v.toObject(), likeCount: v.likes.length })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
