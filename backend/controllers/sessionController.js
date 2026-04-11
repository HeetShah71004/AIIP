import Session from '../models/Session.js';
import Question from '../models/Question.js';
import QuestionBank from '../models/QuestionBank.js';
import {
  evaluateAnswer,
  generateQuestionsFromResume,
  generateTargetedQuestions,
  generateFollowUpQuestion
} from '../services/aiService.js';
import { processAnswerDifficulty } from '../services/adaptiveDifficultyService.js';
import { sendPeerInterviewReminderEmail } from '../services/emailService.js';

const DEFAULT_PEER_MEETING_BASE_URL = 'https://meet.jit.si';

const normalizeMeetingBaseUrl = (value) => {
  const candidate = String(value || '').trim();
  if (!candidate) return DEFAULT_PEER_MEETING_BASE_URL;
  return candidate.replace(/\/+$/, '');
};

const sanitizeRoomToken = (value) => {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .trim();
};

const buildMeetingUrl = (sessionId) => {
  const baseUrl = normalizeMeetingBaseUrl(
    process.env.PEER_MEETING_BASE_URL || process.env.JITSI_BASE_URL
  );
  const roomToken = sanitizeRoomToken(sessionId);
  const roomName = `interv-ai-peer-${roomToken || Date.now()}`;

  const url = new URL(`${baseUrl}/${roomName}`);

  if (url.hostname === 'meet.jit.si') {
    // Lower friction defaults for the public instance.
    url.hash = [
      'config.prejoinPageEnabled=false',
      'config.requireDisplayName=false'
    ].join('&');
  }

  return url.toString();
};

const getConfiguredMeetingBaseOrigin = () => {
  const baseUrl = normalizeMeetingBaseUrl(
    process.env.PEER_MEETING_BASE_URL || process.env.JITSI_BASE_URL
  );

  try {
    return new URL(baseUrl).origin;
  } catch {
    return new URL(DEFAULT_PEER_MEETING_BASE_URL).origin;
  }
};

const needsMeetingUrlRefresh = (meetingJoinUrl) => {
  if (!meetingJoinUrl) return true;

  try {
    const url = new URL(String(meetingJoinUrl));
    const configuredOrigin = getConfiguredMeetingBaseOrigin();

    if (url.origin !== configuredOrigin) return true;

    if (
      url.hostname === 'meet.jit.si'
      && !String(url.hash || '').includes('config.prejoinPageEnabled=false')
    ) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
};

const refreshInternalMeetingUrlIfNeeded = async (sessionDoc, { persist = false } = {}) => {
  if (!sessionDoc?.peerInterview) return sessionDoc;

  const provider = String(sessionDoc.peerInterview.meetingProvider || 'internal').toLowerCase();
  if (provider !== 'internal') return sessionDoc;

  const currentUrl = sessionDoc.peerInterview.meetingJoinUrl;
  if (!needsMeetingUrlRefresh(currentUrl)) return sessionDoc;

  sessionDoc.peerInterview.meetingJoinUrl = buildMeetingUrl(sessionDoc._id);
  if (persist) {
    await sessionDoc.save();
  }

  return sessionDoc;
};

const isValidDate = (value) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const toPositiveDuration = (durationMinutes, fallback = 45) => {
  const parsed = Number(durationMinutes);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 180);
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const calculateMatchScore = (sessionDoc, requestedTopic, requestedTimezone) => {
  const slot = sessionDoc.peerInterview || {};
  let score = 0;

  if (requestedTimezone && normalize(slot.timezone) === normalize(requestedTimezone)) {
    score += 30;
  }

  if (requestedTopic && normalize(slot.topic).includes(normalize(requestedTopic))) {
    score += 40;
  }

  const minutesUntilStart = Math.max(0, Math.floor((new Date(slot.startAt) - new Date()) / 60000));
  if (minutesUntilStart >= 60 && minutesUntilStart <= 1440) {
    score += 20;
  }

  return score;
};

// Start a new interview session
export const startSession = async (req, res) => {
  try {
    const { totalQuestions = 5, category, difficulty, useResume = false, company, roleLevel, interviewRound } = req.body;
    const requestedTotalQuestions = Number(totalQuestions) > 0 ? Number(totalQuestions) : 5;
    const effectiveTotalQuestions = useResume && interviewRound === 'Coding' ? 2 : requestedTotalQuestions;

    let initialQuestions = [];
    let resumeData = null;

    if (useResume) {
      // Find the latest session with resume data for this user
      const lastResumeSession = await Session.findOne({
        user: req.user.id,
        resumeText: { $exists: true }
      }).sort({ createdAt: -1 });

      const inferredType = interviewRound === 'Coding'
        ? 'Coding'
        : (interviewRound === 'Technical' || interviewRound === 'System Design' ? 'Technical' : 'Behavioral');

      if (lastResumeSession) {
        resumeData = lastResumeSession.parsedData;
        const generatedQuestions = await generateQuestionsFromResume(resumeData, effectiveTotalQuestions, interviewRound || 'Technical');

        initialQuestions = generatedQuestions.map(text => ({
          text,
          type: inferredType,
          codeTemplate: inferredType === 'Coding' ? '// Start coding here...' : undefined
        }));
      }

      // Hard fallback: never leave resume-based sessions without seeded questions.
      if (initialQuestions.length === 0) {
        const fallbackQuestions = await generateTargetedQuestions(
          company,
          roleLevel,
          interviewRound || 'Technical',
          effectiveTotalQuestions
        );

        initialQuestions = fallbackQuestions.map(text => ({
          text,
          type: inferredType,
          codeTemplate: inferredType === 'Coding' ? '// Start coding here...' : undefined
        }));
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
        { $sample: { size: effectiveTotalQuestions } }
      ]);

      if (bankQuestions.length < effectiveTotalQuestions) {
        try {
          const needed = effectiveTotalQuestions - bankQuestions.length;
          const generatedTextArray = await generateTargetedQuestions(company, roleLevel, interviewRound, needed);

          // Save the generated questions back to QuestionBank to enrich the DB
          const newBankQuestions = await Promise.all(generatedTextArray.map(async text => {
            let qt = 'Technical';
            if (interviewRound === 'Coding') qt = 'Coding';
            else if (interviewRound === 'Behavioral') qt = 'Behavioral';
            else if (['System Design', 'Phone Screen'].includes(interviewRound)) qt = 'Technical'; // May use theoretical layout in frontend

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
      totalQuestions: effectiveTotalQuestions,
      status: 'pending',
      parsedData: resumeData, // Carry over parsed data if using resume
      company,
      roleLevel,
      interviewRound
    });

    // If we have initial questions (from resume), create Question entries
    if (initialQuestions.length > 0) {
      const perQuestionTime = Math.ceil(30 / effectiveTotalQuestions); // Assuming 30 mins total
      const questionPromises = initialQuestions.map(q =>
        Question.create({
          session: session._id,
          text: q.text,
          questionBankId: q.bankId,
          type: q.type || 'Behavioral',
          codeTemplate: q.codeTemplate,
          timeLimit: perQuestionTime
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
    const { timeSpent = 0 } = req.body;
    let question = await Question.findById(questionId);
    if (!question) {
      // If questionId was actually a QuestionBank ID, create a new Question instance
      const bankQuestion = await QuestionBank.findById(questionId);
      if (bankQuestion) {
        question = await Question.create({
          session: session._id,
          questionBankId: bankQuestion._id,
          text: bankQuestion.text,
          answer,
          timeSpent,
          difficulty: bankQuestion.difficulty || 'Medium'
        });
      } else {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }
    } else {
      question.answer = answer;
      question.timeSpent = timeSpent;
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

    // Process adaptive difficulty: update session rating and calculate next difficulty
    const currentDifficulty = question.difficulty || 'Medium';
    const difficultyResult = processAnswerDifficulty(session, evaluation.score, currentDifficulty);
    session.difficultyRating = difficultyResult.newRating;
    const nextDifficulty = difficultyResult.nextDifficulty;

    const nextIndex = session.completedQuestions;
    if (nextIndex < session.totalQuestions) {
      let nextQuestion = await Question.findOne({ session: session._id, answer: { $exists: false } }).sort({ createdAt: 1 });
      
      if (session.interviewRound === 'Coding') {
        // For coding rounds, always keep the next question independent from previous answers.

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
              codeTemplate: bankQuestion[0].codeTemplate,
              difficulty: nextDifficulty,
              timeLimit: Math.ceil(30 / session.totalQuestions)
            });
          } else {
            const generated = await generateTargetedQuestions(session.company, session.roleLevel, 'Coding', 1);
            nextQuestion = await Question.create({
              session: session._id,
              text: generated[0] || 'Solve this coding problem: find the longest substring without repeating characters.',
              type: 'Coding',
              difficulty: nextDifficulty,
              timeLimit: Math.ceil(30 / session.totalQuestions)
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

        const perQuestionTime = Math.ceil(30 / session.totalQuestions);
        if (nextQuestion) {
          nextQuestion.text = followUpText;
          nextQuestion.type = session.interviewRound === 'Behavioral' ? 'Behavioral' : (session.interviewRound === 'Coding' ? 'Coding' : 'Technical');
          nextQuestion.difficulty = nextDifficulty;
          nextQuestion.timeLimit = perQuestionTime;
          await nextQuestion.save();
        } else {
          await Question.create({
            session: session._id,
            text: followUpText,
            type: session.interviewRound === 'Behavioral' ? 'Behavioral' : (session.interviewRound === 'Coding' ? 'Coding' : 'Technical'),
            difficulty: nextDifficulty,
            timeLimit: perQuestionTime
          });
        }
      }
    }

    if (session.completedQuestions >= session.totalQuestions) {
      session.status = 'completed';
      session.completedAt = Date.now();
    }
    await session.save();

    // Prepare next question data if not completed
    let nextQuestionData = null;
    if (session.completedQuestions < session.totalQuestions) {
      const nextQues = await Question.findOne({ session: session._id, answer: { $exists: false } }).sort({ createdAt: 1 });
      if (nextQues) {
        nextQuestionData = {
          _id: nextQues._id,
          text: nextQues.text,
          type: nextQues.type,
          difficulty: nextQues.difficulty,
          timeLimit: nextQues.timeLimit,
          codeTemplate: nextQues.codeTemplate
        };
      }
    }

    res.status(200).json({
      success: true,
      data: question,
      nextQuestion: nextQuestionData,
      difficultyRating: session.difficultyRating,
      sessionProgress: {
        completed: session.completedQuestions,
        total: session.totalQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Streaming version of submitAnswer using SSE
export const submitAnswerStream = async (req, res) => {
  const { questionId, answer, timeSpent = 0 } = req.body;
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

    // Save evaluation and time spent
    question.answer = answer;
    question.timeSpent = timeSpent;
    question.feedback = evaluation;
    await question.save();

    // Update session
    session.completedQuestions += 1;
    session.score = session.completedQuestions === 1
      ? evaluation.score
      : ((session.score * (session.completedQuestions - 1)) + evaluation.score) / session.completedQuestions;

    // Process adaptive difficulty
    const currentDifficulty = question.difficulty || 'Medium';
    const difficultyResult = processAnswerDifficulty(session, evaluation.score, currentDifficulty);
    session.difficultyRating = difficultyResult.newRating;
    const nextDifficulty = difficultyResult.nextDifficulty;

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
              codeTemplate: bankQuestion[0].codeTemplate,
              difficulty: nextDifficulty,
              timeLimit: Math.ceil(30 / session.totalQuestions)
            });
          } else {
            const generated = await generateTargetedQuestions(session.company, session.roleLevel, 'Coding', 1);
            nextQuestion = await Question.create({
              session: session._id,
              text: generated[0] || 'Solve this coding problem: find the longest substring without repeating characters.',
              type: 'Coding',
              difficulty: nextDifficulty,
              timeLimit: Math.ceil(30 / session.totalQuestions)
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

        const perQuestionTime = Math.ceil(30 / session.totalQuestions);
        if (nextQuestion) {
          nextQuestion.text = followUpText;
          nextQuestion.type = session.interviewRound === 'Behavioral' ? 'Behavioral' : (session.interviewRound === 'Coding' ? 'Coding' : 'Technical');
          nextQuestion.difficulty = nextDifficulty;
          nextQuestion.timeLimit = perQuestionTime;
          await nextQuestion.save();
        } else {
          nextQuestion = await Question.create({
            session: session._id,
            text: followUpText,
            type: session.interviewRound === 'Behavioral' ? 'Behavioral' : (session.interviewRound === 'Coding' ? 'Coding' : 'Technical'),
            difficulty: nextDifficulty,
            timeLimit: perQuestionTime
          });
        }
      }

      // 5. Stream the next question
      sendEvent('nextQuestion', {
        text: nextQuestion.text,
        _id: nextQuestion._id,
        type: nextQuestion.type,
        difficulty: nextQuestion.difficulty,
        timeLimit: nextQuestion.timeLimit,
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

export const createPeerAvailability = async (req, res) => {
  try {
    const {
      role,
      level,
      topic,
      startAt,
      durationMinutes = 45,
      timezone = 'UTC',
      meetingProvider = 'internal'
    } = req.body;

    if (!role || !level || !startAt) {
      return res.status(400).json({ success: false, message: 'role, level and startAt are required.' });
    }

    if (!isValidDate(startAt)) {
      return res.status(400).json({ success: false, message: 'Invalid startAt value.' });
    }

    const start = new Date(startAt);
    if (start <= new Date()) {
      return res.status(400).json({ success: false, message: 'Availability slot must be in the future.' });
    }

    const validDuration = toPositiveDuration(durationMinutes);
    const end = new Date(start.getTime() + validDuration * 60000);

    const slot = await Session.create({
      user: req.user.id,
      sessionType: 'peer',
      status: 'open',
      peerInterview: {
        hostUser: req.user.id,
        role,
        level,
        topic,
        timezone,
        startAt: start,
        endAt: end,
        meetingProvider,
        meetingJoinUrl: buildMeetingUrl(Date.now())
      }
    });

    // Keep the join URL deterministic and tied to created id.
    slot.peerInterview.meetingJoinUrl = buildMeetingUrl(slot._id);
    await slot.save();

    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchPeerAvailability = async (req, res) => {
  try {
    const { role, level, topic, timezone } = req.query;
    const now = new Date();
    const query = {
      sessionType: 'peer',
      status: 'open',
      'peerInterview.startAt': { $gte: now },
      'peerInterview.hostUser': { $ne: req.user.id },
      'peerInterview.guestUser': { $exists: false }
    };

    if (role) query['peerInterview.role'] = new RegExp(String(role), 'i');
    if (level) query['peerInterview.level'] = new RegExp(String(level), 'i');
    if (topic) query['peerInterview.topic'] = new RegExp(String(topic), 'i');

    const slots = await Session.find(query)
      .sort({ 'peerInterview.startAt': 1 })
      .limit(30)
      .populate('peerInterview.hostUser', 'name email avatar');

    await Promise.all(slots.map((slot) => refreshInternalMeetingUrlIfNeeded(slot, { persist: true })));

    const ranked = slots
      .map((slot) => ({
        ...slot.toObject(),
        matchScore: calculateMatchScore(slot, topic, timezone)
      }))
      .sort((a, b) => b.matchScore - a.matchScore || new Date(a.peerInterview.startAt) - new Date(b.peerInterview.startAt));

    res.status(200).json({ success: true, count: ranked.length, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const autoMatchPeer = async (req, res) => {
  try {
    const { role, level, topic, timezone } = req.body;
    const query = {
      sessionType: 'peer',
      status: 'open',
      'peerInterview.startAt': { $gte: new Date() },
      'peerInterview.hostUser': { $ne: req.user.id },
      'peerInterview.guestUser': { $exists: false }
    };

    if (role) query['peerInterview.role'] = new RegExp(String(role), 'i');
    if (level) query['peerInterview.level'] = new RegExp(String(level), 'i');
    if (topic) query['peerInterview.topic'] = new RegExp(String(topic), 'i');

    const candidates = await Session.find(query)
      .limit(30)
      .populate('peerInterview.hostUser', 'name email avatar');

    await Promise.all(candidates.map((slot) => refreshInternalMeetingUrlIfNeeded(slot, { persist: true })));

    if (candidates.length === 0) {
      return res.status(200).json({ success: true, data: null, message: 'No peer slots found right now.' });
    }

    const best = candidates
      .map((slot) => ({ slot, score: calculateMatchScore(slot, topic, timezone) }))
      .sort((a, b) => b.score - a.score || new Date(a.slot.peerInterview.startAt) - new Date(b.slot.peerInterview.startAt))[0];

    res.status(200).json({
      success: true,
      data: {
        ...best.slot.toObject(),
        matchScore: best.score
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookPeerSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required.' });
    }

    const target = await Session.findById(sessionId);
    if (!target || target.sessionType !== 'peer') {
      return res.status(404).json({ success: false, message: 'Peer slot not found.' });
    }

    if (String(target.peerInterview?.hostUser) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot book your own availability slot.' });
    }

    if (target.status !== 'open') {
      return res.status(409).json({ success: false, message: 'This slot is no longer available.' });
    }

    await refreshInternalMeetingUrlIfNeeded(target, { persist: true });

    const conflict = await Session.findOne({
      sessionType: 'peer',
      status: 'booked',
      $or: [
        { 'peerInterview.hostUser': req.user.id },
        { 'peerInterview.guestUser': req.user.id }
      ],
      'peerInterview.startAt': { $lt: target.peerInterview.endAt },
      'peerInterview.endAt': { $gt: target.peerInterview.startAt }
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: 'You already have a booked peer interview at this time.' });
    }

    const booked = await Session.findOneAndUpdate(
      { _id: sessionId, sessionType: 'peer', status: 'open' },
      {
        $set: {
          status: 'booked',
          'peerInterview.guestUser': req.user.id,
          'peerInterview.meetingJoinUrl': target.peerInterview?.meetingJoinUrl || buildMeetingUrl(sessionId)
        }
      },
      { new: true }
    )
      .populate('peerInterview.hostUser', 'name email avatar')
      .populate('peerInterview.guestUser', 'name email avatar');

    if (!booked) {
      return res.status(409).json({ success: false, message: 'Slot was taken by another user.' });
    }

    res.status(200).json({ success: true, data: booked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUpcomingPeerSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      sessionType: 'peer',
      status: { $in: ['open', 'booked'] },
      'peerInterview.startAt': { $gte: new Date() },
      $or: [
        { 'peerInterview.hostUser': req.user.id },
        { 'peerInterview.guestUser': req.user.id }
      ]
    })
      .sort({ 'peerInterview.startAt': 1 })
      .populate('peerInterview.hostUser', 'name email avatar')
      .populate('peerInterview.guestUser', 'name email avatar');

    await Promise.all(sessions.map((session) => refreshInternalMeetingUrlIfNeeded(session, { persist: true })));

    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reschedulePeerSession = async (req, res) => {
  try {
    const { startAt, durationMinutes } = req.body;
    if (!startAt || !isValidDate(startAt)) {
      return res.status(400).json({ success: false, message: 'Valid startAt is required.' });
    }

    const session = await Session.findById(req.params.id);
    if (!session || session.sessionType !== 'peer') {
      return res.status(404).json({ success: false, message: 'Peer session not found.' });
    }

    const isHost = String(session.peerInterview?.hostUser) === String(req.user.id);
    const isGuest = String(session.peerInterview?.guestUser) === String(req.user.id);
    if (!isHost && !isGuest) {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this session.' });
    }

    const start = new Date(startAt);
    if (start <= new Date()) {
      return res.status(400).json({ success: false, message: 'Rescheduled time must be in the future.' });
    }

    const existingDurationMs = Math.max(
      15 * 60000,
      new Date(session.peerInterview?.endAt || start).getTime() - new Date(session.peerInterview?.startAt || start).getTime()
    );
    const nextDurationMs = durationMinutes
      ? toPositiveDuration(durationMinutes) * 60000
      : existingDurationMs;

    session.peerInterview.startAt = start;
    session.peerInterview.endAt = new Date(start.getTime() + nextDurationMs);
    session.peerInterview.reminderState.oneDaySent = false;
    session.peerInterview.reminderState.oneHourSent = false;
    await session.save();

    const updated = await Session.findById(session._id)
      .populate('peerInterview.hostUser', 'name email avatar')
      .populate('peerInterview.guestUser', 'name email avatar');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelPeerSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.sessionType !== 'peer') {
      return res.status(404).json({ success: false, message: 'Peer session not found.' });
    }

    const isHost = String(session.peerInterview?.hostUser) === String(req.user.id);
    const isGuest = String(session.peerInterview?.guestUser) === String(req.user.id);
    if (!isHost && !isGuest) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this session.' });
    }

    session.status = 'cancelled';
    await session.save();

    res.status(200).json({ success: true, message: 'Peer session cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handlePeerCalendarWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.CALENDAR_WEBHOOK_SECRET;
    if (webhookSecret && req.headers['x-calendar-webhook-secret'] !== webhookSecret) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret.' });
    }

    const { calendarEventId, status, startAt, endAt, meetingJoinUrl } = req.body;
    if (!calendarEventId) {
      return res.status(400).json({ success: false, message: 'calendarEventId is required.' });
    }

    const session = await Session.findOne({ sessionType: 'peer', 'peerInterview.calendarEventId': calendarEventId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Peer session not found for event.' });
    }

    if (meetingJoinUrl) session.peerInterview.meetingJoinUrl = meetingJoinUrl;
    if (startAt && isValidDate(startAt)) session.peerInterview.startAt = new Date(startAt);
    if (endAt && isValidDate(endAt)) session.peerInterview.endAt = new Date(endAt);
    if (status && ['open', 'matched', 'booked', 'cancelled', 'completed'].includes(status)) {
      session.status = status;
      if (status === 'completed' && !session.completedAt) session.completedAt = new Date();
    }

    await session.save();

    res.status(200).json({ success: true, message: 'Webhook processed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const dispatchPeerReminders = async (req, res) => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60000);

    const sessions = await Session.find({
      sessionType: 'peer',
      status: 'booked',
      'peerInterview.startAt': { $gte: now, $lte: in24h },
      $or: [
        { 'peerInterview.reminderState.oneDaySent': false },
        { 'peerInterview.reminderState.oneHourSent': false }
      ]
    })
      .populate('peerInterview.hostUser', 'name email')
      .populate('peerInterview.guestUser', 'name email');

    let remindersSent = 0;
    let sessionsUpdated = 0;

    for (const session of sessions) {
      const start = new Date(session.peerInterview.startAt);
      const minutesUntil = Math.floor((start.getTime() - now.getTime()) / 60000);
      if (minutesUntil <= 0) continue;

      const shouldSendOneHour = minutesUntil <= 60 && !session.peerInterview.reminderState?.oneHourSent;
      const shouldSendOneDay = minutesUntil > 60 && minutesUntil <= 24 * 60 && !session.peerInterview.reminderState?.oneDaySent;

      if (!shouldSendOneHour && !shouldSendOneDay) continue;

      const host = session.peerInterview.hostUser;
      const guest = session.peerInterview.guestUser;
      const role = session.peerInterview.role;
      const level = session.peerInterview.level;
      const topic = session.peerInterview.topic;
      const timezone = session.peerInterview.timezone;
      const joinUrl = session.peerInterview.meetingJoinUrl || buildMeetingUrl(session._id);
      const readableStart = start.toLocaleString();

      const promises = [];
      if (host?.email) {
        promises.push(sendPeerInterviewReminderEmail({
          to: host.email,
          recipientName: host.name,
          partnerName: guest?.name,
          role,
          level,
          topic,
          startAt: readableStart,
          timezone,
          joinUrl
        }));
      }
      if (guest?.email) {
        promises.push(sendPeerInterviewReminderEmail({
          to: guest.email,
          recipientName: guest.name,
          partnerName: host?.name,
          role,
          level,
          topic,
          startAt: readableStart,
          timezone,
          joinUrl
        }));
      }

      const results = await Promise.all(promises);
      remindersSent += results.filter((result) => result?.sent).length;

      if (!session.peerInterview.reminderState) {
        session.peerInterview.reminderState = {
          oneDaySent: false,
          oneHourSent: false,
          lastSentAt: null
        };
      }

      if (shouldSendOneDay) session.peerInterview.reminderState.oneDaySent = true;
      if (shouldSendOneHour) session.peerInterview.reminderState.oneHourSent = true;
      session.peerInterview.reminderState.lastSentAt = new Date();

      await session.save();
      sessionsUpdated += 1;
    }

    res.status(200).json({
      success: true,
      data: {
        sessionsChecked: sessions.length,
        sessionsUpdated,
        remindersSent
      }
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
