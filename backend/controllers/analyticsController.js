import Session from '../models/Session.js';
import Question from '../models/Question.js';
import mongoose from 'mongoose';

// Get high-level analytics for the user
export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 1. Session history (with pagination support)
    const sessionHistory = await Session.find({ user: userId, status: 'completed' })
      .sort({ completedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('score createdAt completedAt');

    // 2. Average score per category (fixed aggregation with QuestionBank join)
    const categoryStats = await Question.aggregate([
      {
        $lookup: {
          from: 'sessions',
          localField: 'session',
          foreignField: '_id',
          as: 'sessionData'
        }
      },
      { $unwind: '$sessionData' },
      { $match: { 'sessionData.user': new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'questionbanks',
          localField: 'questionBankId',
          foreignField: '_id',
          as: 'bankData'
        }
      },
      { $unwind: '$bankData' },
      {
        $group: {
          _id: '$bankData.category',
          avgScore: { $avg: '$feedback.score' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Overall stats
    const totalSessions = await Session.countDocuments({ user: userId, status: 'completed' });
    
    // Total questions answered
    const totalQuestionsAnswered = await Question.countDocuments({
      session: { $in: await Session.find({ user: userId, status: 'completed' }).distinct('_id') },
      'feedback.score': { $exists: true }
    });

    // Highest score
    const highestScoreData = await Session.findOne({ user: userId, status: 'completed' })
      .sort({ score: -1 })
      .select('score');

    const avgOverallScore = await Session.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);

    // Calculate streak
    const allCompletedSessions = await Session.find({ user: userId, status: 'completed', completedAt: { $exists: true, $ne: null } })
      .sort({ completedAt: -1 })
      .select('completedAt');

    let streak = 0;
    if (allCompletedSessions.length > 0) {
      // Get unique dates in YYYY-MM-DD format, sorted descending
      const dates = [...new Set(allCompletedSessions.map(s => 
        new Date(s.completedAt).toISOString().split('T')[0]
      ))];
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // If the most recent session was today or yesterday, start counting
      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
          const current = new Date(dates[i]);
          const next = new Date(dates[i + 1]);
          
          // Check if next date is exactly one day before current date
          const expectedNext = new Date(current);
          expectedNext.setDate(current.getDate() - 1);
          const expectedNextStr = expectedNext.toISOString().split('T')[0];
          
          if (dates[i + 1] === expectedNextStr) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        sessionHistory,
        categoryStats,
        totalSessions,
        totalQuestionsAnswered,
        totalPages: Math.ceil(totalSessions / limit),
        currentPage: page,
        highestScore: highestScoreData?.score || 0,
        avgOverallScore: avgOverallScore[0]?.avg || 0,
        streak
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
