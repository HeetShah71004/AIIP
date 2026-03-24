import Session from '../models/Session.js';
import Question from '../models/Question.js';
import QuestionBank from '../models/QuestionBank.js';
import { 
    evaluateAnswer, 
    generateQuestionsFromResume, 
    generateTargetedQuestions, 
    generateFollowUpQuestion 
} from '../services/aiService.js';

// Start a new interview session
export const startSession = async (req, res) => {
  try {
    const { totalQuestions = 5, category, difficulty, useResume = false, company, roleLevel, interviewRound } = req.body;
    
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
    } else if (company || roleLevel || interviewRound || category || difficulty) {
      const matchQuery = {};
      if (company) matchQuery.companyTags = { $in: [company] };
      if (roleLevel) matchQuery.roleLevel = roleLevel;
      if (interviewRound) {
          if (interviewRound === 'Coding') {
              matchQuery.type = 'Coding';
          } else {
              matchQuery.interviewRound = interviewRound;
          }
      }
      if (category) matchQuery.category = category;
      if (difficulty) matchQuery.difficulty = difficulty;

      let bankQuestions = await QuestionBank.aggregate([
        { $match: matchQuery },
        { $sample: { size: totalQuestions } }
      ]);
      
      if (bankQuestions.length < totalQuestions) {
        try {
          const needed = totalQuestions - bankQuestions.length;
          const generatedTextArray = await generateTargetedQuestions(company, roleLevel, interviewRound, needed);
          
          // Save the generated questions back to QuestionBank to enrich the DB
          const newBankQuestions = await Promise.all(generatedTextArray.map(async text => {
             const qt = interviewRound === 'Coding' ? 'Coding' : 'Technical';
             return await QuestionBank.create({
                text,
                category: category || 'Fullstack',
                difficulty: difficulty || 'Medium',
                companyTags: company ? [company] : [],
                roleLevel,
                interviewRound,
                type: qt
             });
          }));
          bankQuestions = [...bankQuestions, ...newBankQuestions];
        } catch (aiErr) {
          console.error("AI Generation failed", aiErr);
        }
      }

      initialQuestions = bankQuestions.map(bq => ({ 
        text: bq.text, 
        bankId: bq._id,
        type: bq.type,
        codeTemplate: bq.codeTemplate
      }));
    }

    // Create new session
    const session = await Session.create({
      user: req.user.id,
      totalQuestions,
      status: 'pending',
      parsedData: resumeData, // Carry over parsed data if using resume
      company,
      roleLevel,
      interviewRound
    });

    // If we have initial questions (from resume), create Question entries
    if (initialQuestions.length > 0) {
      const questionPromises = initialQuestions.map(q => 
        Question.create({
          session: session._id,
          text: q.text,
          questionBankId: q.bankId,
          type: q.type || 'Behavioral',
          codeTemplate: q.codeTemplate
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

    const nextIndex = session.completedQuestions;
    if (nextIndex < session.totalQuestions) {
      if (session.interviewRound === 'Coding') {
        // For coding rounds, always keep the next question independent from previous answers.
        let nextQuestion = await Question.findOne({ session: session._id, answer: { $exists: false } }).sort({ createdAt: 1 });

        if (!nextQuestion) {
          const existingQuestions = await Question.find({ session: session._id }).select('questionBankId');
          const usedBankIds = existingQuestions
            .filter(q => q.questionBankId)
            .map(q => q.questionBankId);

          const matchQuery = { type: 'Coding' };
          if (session.company) matchQuery.companyTags = { $in: [session.company] };
          if (session.roleLevel) matchQuery.roleLevel = session.roleLevel;

          let bankQuestion = await QuestionBank.aggregate([
            { $match: matchQuery },
            ...(usedBankIds.length ? [{ $match: { _id: { $nin: usedBankIds } } }] : []),
            { $sample: { size: 1 } }
          ]);

          if (!bankQuestion.length) {
            bankQuestion = await QuestionBank.aggregate([
              { $match: matchQuery },
              { $sample: { size: 1 } }
            ]);
          }

          if (bankQuestion.length) {
            nextQuestion = await Question.create({
              session: session._id,
              questionBankId: bankQuestion[0]._id,
              text: bankQuestion[0].text,
              type: 'Coding',
              codeTemplate: bankQuestion[0].codeTemplate
            });
          } else {
            const generated = await generateTargetedQuestions(session.company, session.roleLevel, 'Coding', 1);
            nextQuestion = await Question.create({
              session: session._id,
              text: generated[0] || 'Solve this coding problem: find the longest substring without repeating characters.',
              type: 'Coding'
            });
          }
        }
      } else {
        let followUpText;
        if (answer === '__SKIPPED__' || evaluation.score === 0) {
          followUpText = "It seems we had a bit of a disconnect there. Let's try a fresh one: Can you tell me about a time you had to learn a new technology quickly?";
        } else {
          // Generate follow-up question
          followUpText = await generateFollowUpQuestion(question.text, answer, evaluation);
        }

        // Check if there's already a next question placeholder
        let nextQuestion = await Question.findOne({ session: session._id, answer: { $exists: false } }).sort({ createdAt: 1 });

        if (nextQuestion) {
          nextQuestion.text = followUpText;
          nextQuestion.type = 'Technical';
          await nextQuestion.save();
        } else {
          await Question.create({
            session: session._id,
            text: followUpText,
            type: 'Technical'
          });
        }
      }
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

// Streaming version of submitAnswer using SSE
export const submitAnswerStream = async (req, res) => {
  const { questionId, answer } = req.body;
  const sessionId = req.params.id;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      sendEvent('error', { message: 'Session not found' });
      return res.end();
    }

    let question = await Question.findById(questionId);
    if (!question) {
      sendEvent('error', { message: 'Question not found' });
      return res.end();
    }

    // 1. Send "thinking" status for evaluation
    sendEvent('status', { message: 'Evaluating your answer...' });

    // 2. Perform evaluation
    let evaluation;
    if (answer === '__SKIPPED__') {
      evaluation = {
        score: 0, analysis: "Question skipped.", strengths: [], weaknesses: ["Skipped"], suggestions: ["Don't skip!"]
      };
    } else {
      evaluation = await evaluateAnswer(question.text, answer);
    }

    // Save evaluation
    question.answer = answer;
    question.feedback = evaluation;
    await question.save();

    // Update session
    session.completedQuestions += 1;
    session.score = session.completedQuestions === 1 
      ? evaluation.score 
      : ((session.score * (session.completedQuestions - 1)) + evaluation.score) / session.completedQuestions;
    
    if (session.completedQuestions >= session.totalQuestions) {
      session.status = 'completed';
      session.completedAt = Date.now();
    }
    await session.save();

    // 3. Stream the evaluation result
    sendEvent('evaluation', evaluation);

    // 4. Handle next question
    if (session.status !== 'completed') {
      sendEvent('status', { message: 'Preparing next question...' });

      let nextQuestion = await Question.findOne({ session: session._id, answer: { $exists: false } }).sort({ createdAt: 1 });

      if (session.interviewRound === 'Coding') {
        // Keep coding questions independent from previous answer/evaluation.
        if (!nextQuestion) {
          const existingQuestions = await Question.find({ session: session._id }).select('questionBankId');
          const usedBankIds = existingQuestions
            .filter(q => q.questionBankId)
            .map(q => q.questionBankId);

          const matchQuery = { type: 'Coding' };
          if (session.company) matchQuery.companyTags = { $in: [session.company] };
          if (session.roleLevel) matchQuery.roleLevel = session.roleLevel;

          let bankQuestion = await QuestionBank.aggregate([
            { $match: matchQuery },
            ...(usedBankIds.length ? [{ $match: { _id: { $nin: usedBankIds } } }] : []),
            { $sample: { size: 1 } }
          ]);

          if (!bankQuestion.length) {
            bankQuestion = await QuestionBank.aggregate([
              { $match: matchQuery },
              { $sample: { size: 1 } }
            ]);
          }

          if (bankQuestion.length) {
            nextQuestion = await Question.create({
              session: session._id,
              questionBankId: bankQuestion[0]._id,
              text: bankQuestion[0].text,
              type: 'Coding',
              codeTemplate: bankQuestion[0].codeTemplate
            });
          } else {
            const generated = await generateTargetedQuestions(session.company, session.roleLevel, 'Coding', 1);
            nextQuestion = await Question.create({
              session: session._id,
              text: generated[0] || 'Solve this coding problem: find the longest substring without repeating characters.',
              type: 'Coding'
            });
          }
        }
      } else {
        let followUpText;
        if (answer === '__SKIPPED__' || evaluation.score === 0) {
          followUpText = "It seems we had a bit of a disconnect there. Let's try a fresh one: Can you tell me about a time you had to learn a new technology quickly?";
        } else {
          followUpText = await generateFollowUpQuestion(question.text, answer, evaluation);
        }

        if (nextQuestion) {
          nextQuestion.text = followUpText;
          nextQuestion.type = 'Technical';
          await nextQuestion.save();
        } else {
          nextQuestion = await Question.create({
            session: session._id,
            text: followUpText,
            type: 'Technical'
          });
        }
      }

      // 5. Stream the next question
      sendEvent('nextQuestion', {
        text: nextQuestion.text,
        _id: nextQuestion._id,
        type: nextQuestion.type,
        codeTemplate: nextQuestion.codeTemplate
      });
    } else {
      sendEvent('final', { message: 'Session completed!' });
    }

    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    sendEvent('error', { message: error.message });
    res.end();
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
