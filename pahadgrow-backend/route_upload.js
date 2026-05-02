import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authMiddleware } from './middleware_auth.js';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Image storage (products) ─────────────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'pahadgrow',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
    transformation:   [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// ─── Video storage (knowledge) ────────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'pahadgrow/knowledge/videos',
    resource_type:   'video',
    allowed_formats: ['mp4', 'mov', 'webm', 'avi'],
    transformation:  [{ quality: 'auto' }],
  },
});

// ─── Thumbnail storage (knowledge) ───────────────────────────────────────────
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'pahadgrow/knowledge/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 800, height: 450, crop: 'fill', quality: 'auto' }],
  },
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 200 * 1024 * 1024 } });
const uploadThumb = multer({ storage: thumbnailStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Single image (existing) ──────────────────────────────────────────────────
router.post('/image', authMiddleware, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    res.json({ success: true, url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// ─── Multiple images (existing) ───────────────────────────────────────────────
router.post('/multiple', authMiddleware, uploadImage.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No images provided' });
    const urls = req.files.map(f => f.path);
    res.json({ success: true, urls });
  } catch (err) {
    console.error('Multiple upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// ─── Video upload (knowledge) ─────────────────────────────────────────────────
router.post('/video', authMiddleware, uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video provided' });
    res.json({ success: true, url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ success: false, message: 'Video upload failed' });
  }
});

// ─── Thumbnail upload (knowledge) ────────────────────────────────────────────
router.post('/thumbnail', authMiddleware, uploadThumb.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No thumbnail provided' });
    res.json({ success: true, url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error('Thumbnail upload error:', err);
    res.status(500).json({ success: false, message: 'Thumbnail upload failed' });
  }
});

export default router;
