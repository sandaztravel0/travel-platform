const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { verifyToken, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Keep the uploaded file in memory (not written to disk) — Railway's filesystem
// isn't persistent between deploys anyway, so we stream straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
});

// ---------- Upload a single image (used by business "add listing" and admin "add location") ----------
// Accepts either a business or an admin login token.
router.post(
  '/',
  verifyToken,
  requireRole('business', 'admin'),
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image file was received.' });

    // Stream the in-memory file buffer up to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'isle-road', resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: uploadResult.secure_url });
  })
);

module.exports = router;
