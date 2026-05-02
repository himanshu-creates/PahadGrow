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

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pahadgrow',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No image provided' });
    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

router.post('/multiple', authMiddleware, upload.array('images', 5), async (req, res) => {
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

export default router;