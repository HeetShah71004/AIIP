import Session from '../models/Session.js';
import Question from '../models/Question.js';
import mongoose from 'mongoose';

// Get high-level analytics for the user
export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Session history (last 10 sessions)
    const sessionHistory = await Session.find({ user: userId, status: 'completed' })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(10)
      .select('score createdAt completedAt');

    // 2. Average score per category
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
        $group: {
          _id: '$category', // This might need adjustment if category is on QuestionBank
          avgScore: { $avg: '$feedback.score' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Overall stats
    const totalSessions = await Session.countDocuments({ user: userId, status: 'completed' });
    const avgOverallScore = await Session.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        sessionHistory,
        categoryStats,
        totalSessions,
        avgOverallScore: avgOverallScore[0]?.avg || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
