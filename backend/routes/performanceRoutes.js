import express from 'express';
import * as performanceController from '../controllers/performanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/predict', protect, performanceController.predictPerformance);

export default router;
