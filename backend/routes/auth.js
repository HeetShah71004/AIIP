import express from 'express';
import {
  register,
  login,
  googleLogin,
  logout,
  getMe,
  inviteCandidate,
  getUserProfile,
  scheduleInterview
} from '../controllers/authController.js';

const router = express.Router();

import { protect } from '../middleware/auth.js';

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/invite-candidate', protect, inviteCandidate);
router.get('/user/:id', protect, getUserProfile);
router.get('/user/:id', protect, getUserProfile);
router.post('/schedule-mock', protect, scheduleInterview);

export default router;
