import express from 'express';
import {
	startSession,
	getSession,
	submitAnswer,
	submitAnswerStream,
	deleteSession,
	createPeerAvailability,
	searchPeerAvailability,
	autoMatchPeer,
	bookPeerSession,
	getUpcomingPeerSessions,
	reschedulePeerSession,
	cancelPeerSession,
	handlePeerCalendarWebhook,
	dispatchPeerReminders
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', protect, startSession);
router.get('/:id', protect, getSession);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/answer-stream', protect, submitAnswerStream);
router.delete('/:id', protect, deleteSession);

router.post('/peer/availability', protect, createPeerAvailability);
router.get('/peer/availability/search', protect, searchPeerAvailability);
router.post('/peer/match', protect, autoMatchPeer);
router.post('/peer/book', protect, bookPeerSession);
router.get('/peer/upcoming', protect, getUpcomingPeerSessions);
router.patch('/peer/:id/reschedule', protect, reschedulePeerSession);
router.patch('/peer/:id/cancel', protect, cancelPeerSession);
router.post('/peer/calendar/webhook', handlePeerCalendarWebhook);
router.post('/peer/reminders/dispatch', protect, dispatchPeerReminders);

export default router;
