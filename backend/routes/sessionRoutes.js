import express from 'express';
import { startSession, getSession, submitAnswer } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', protect, startSession);
router.get('/:id', protect, getSession);
router.post('/:id/answer', protect, submitAnswer);

export default router;
