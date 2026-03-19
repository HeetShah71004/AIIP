import Session from '../models/Session.js';
import Question from '../models/Question.js';
import QuestionBank from '../models/QuestionBank.js';
import { evaluateAnswer, generateQuestionsFromResume } from '../services/aiService.js';

// Start a new interview session
export const startSession = async (req, res) => {
  try {
    const { totalQuestions = 5, category, difficulty, useResume = false } = req.body;
    
    let initialQuestions = [];
    let resumeData = null;

    if (useResume) {
      // Find the latest session with resume data for this user
      const lastResumeSession = await Session.findOne({ 
        user: req.user.id, 
        resumeText: { $exists: true } 
      }).sort({ createdAt: -1 });

      if (lastResumeSession) {
        resumeData = lastResumeSession.parsedData;
        const generatedQuestions = await generateQuestionsFromResume(resumeData, totalQuestions);
        initialQuestions = generatedQuestions.map(text => ({ text }));
      }
    }

    // Create new session
    const session = await Session.create({
      user: req.user.id,
      totalQuestions,
      status: 'pending',
      parsedData: resumeData // Carry over parsed data if using resume
    });

    // If we have initial questions (from resume), create Question entries
    if (initialQuestions.length > 0) {
      const questionPromises = initialQuestions.map(q => 
        Question.create({
          session: session._id,
          text: q.text
        })
      );
      await Promise.all(questionPromises);
    }

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get session layout and all questions/answers
export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const questions = await Question.find({ session: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        session,
        questions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit an answer for a question in a session
export const submitAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Find or create the question entry for this session
    let question = await Question.findById(questionId);
    if (!question) {
        // If questionId was actually a QuestionBank ID, create a new Question instance
        const bankQuestion = await QuestionBank.findById(questionId);
        if (bankQuestion) {
            question = await Question.create({
                session: session._id,
                questionBankId: bankQuestion._id,
                text: bankQuestion.text,
                answer
            });
        } else {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
    } else {
        question.answer = answer;
        await question.save();
    }

    // Update session progress
    session.completedQuestions += 1;
    
    let evaluation;
    if (answer === '__SKIPPED__') {
        evaluation = {
            score: 0,
            clarity: 0,
            depth: 0,
            relevance: 0,
            analysis: "Question skipped by user.",
            strengths: [],
            weaknesses: ["Question was skipped."],
            suggestions: ["Try to answer all questions to get a better assessment."]
        };
    } else {
        // Evaluate the answer using AI Service
        evaluation = await evaluateAnswer(question.text, answer);
    }

    question.feedback = evaluation;
    await question.save();

    // Add evaluation score to session overall score (average)
    if (session.completedQuestions === 1) {
        session.score = evaluation.score;
    } else {
        session.score = ((session.score * (session.completedQuestions - 1)) + evaluation.score) / session.completedQuestions;
    }

    if (session.completedQuestions >= session.totalQuestions) {
        session.status = 'completed';
        session.completedAt = Date.now();
    }
    await session.save();

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a session
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    // Check if the session belongs to the user
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this session' });
    }

    // Delete associated questions
    await Question.deleteMany({ session: session._id });
    
    // Delete session
    await Session.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
