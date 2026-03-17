import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
});

router.post('/upload', protect, upload.single('resume'), uploadResume);

export default router;
