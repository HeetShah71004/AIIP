import express from 'express';
import * as emotionController from '../controllers/emotionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', protect, emotionController.analyzeEmotion);

export default router;
