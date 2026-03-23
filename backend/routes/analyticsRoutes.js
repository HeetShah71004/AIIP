import express from 'express';
import { getAnalyticsSummary, getSkillGap, getAdvancedStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, getAnalyticsSummary);
router.get('/skill-gap', protect, getSkillGap);
router.get('/advanced-stats', protect, getAdvancedStats);

export default router;

