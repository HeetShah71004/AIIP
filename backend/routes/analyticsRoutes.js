import express from 'express';
import { 
  getAnalyticsSummary, 
  getSkillGap, 
  getAdvancedStats,
  getRecruiterStats,
  getTopCandidates,
  exportRecruiterReport,
  getCandidateAIReport
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, getAnalyticsSummary);
router.get('/skill-gap', protect, getSkillGap);
router.get('/advanced-stats', protect, getAdvancedStats);

// Recruiter routes
router.get('/recruiter/stats', protect, getRecruiterStats);
router.get('/recruiter/top-candidates', protect, getTopCandidates);
router.get('/recruiter/export', protect, exportRecruiterReport);
router.get('/recruiter/candidate-report/:candidateId', protect, getCandidateAIReport);

export default router;

