import express from 'express';
import { getQuestions, getQuestionById, createQuestion, seedQuestions } from '../controllers/questionController.js';

const router = express.Router();

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/', createQuestion);
router.post('/seed', seedQuestions);

export default router;
