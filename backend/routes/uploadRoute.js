// backend/routes/uploadRoute.js
// Handles POST /api/upload — stores file on disk under /uploads/
// and returns a public URL the frontend can save on the card.
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(js|ts|py|java|cpp|c|cs|go|rb|php|html|css|json|txt|md|zip|pdf)$/i;
    if (allowed.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('File type not allowed'));
  },
});

// POST /api/upload
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // Return a URL the frontend can use — served as static from /uploads/
  const url = `${process.env.BASE_URL || ''}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.originalname });
});

module.exports = router;