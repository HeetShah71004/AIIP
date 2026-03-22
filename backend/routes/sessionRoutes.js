import express from 'express';
import { startSession, getSession, submitAnswer, submitAnswerStream, deleteSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', protect, startSession);
router.get('/:id', protect, getSession);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/answer-stream', protect, submitAnswerStream);
router.delete('/:id', protect, deleteSession);

export default router;
