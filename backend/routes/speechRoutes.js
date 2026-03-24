import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { transcribeAudio } from '../controllers/speechController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('audio/')) {
      return cb(null, true);
    }

    cb(new Error('Only audio files are allowed.'));
  }
});

router.post('/transcribe', protect, upload.single('audio'), transcribeAudio);

export default router;
