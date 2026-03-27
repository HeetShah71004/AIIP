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
    const sortBy = req.query.sortBy || 'latest';

    // Build sort options
    let sortOptions = { completedAt: -1, createdAt: -1 };
    if (sortBy === 'highestScore') {
      sortOptions = { score: -1, completedAt: -1 };
    }

    // 1. Session history (with pagination support)
    const sessionHistory = await Session.find({ user: userId, status: 'completed' })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('score createdAt completedAt parsedData company roleLevel interviewRound');

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
      { 
        $match: { 
          'sessionData.user': new mongoose.Types.ObjectId(userId),
          'sessionData.status': 'completed',
          'feedback.score': { $exists: true, $ne: null }
        } 
      },
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
          _id: { session: '$sessionData._id', category: '$bankData.category' },
          sessionCategoryScore: { $avg: '$feedback.score' }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          topScore: { $max: '$sessionCategoryScore' },
          avgScore: { $avg: '$sessionCategoryScore' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Overall stats
    const totalSessions = await Session.countDocuments({ user: userId, status: 'completed' });
    
    const completedSessionIds = await Session.find({ user: userId, status: 'completed' }).distinct('_id');
    
    // Total questions actually answered
    const totalQuestionsAnswered = await Question.countDocuments({
      session: { $in: completedSessionIds },
      answer: { $ne: '__SKIPPED__' },
      'feedback.score': { $exists: true }
    });

    // Total questions skipped
    const totalSkippedQuestions = await Question.countDocuments({
      session: { $in: completedSessionIds },
      answer: '__SKIPPED__'
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
        totalSkippedQuestions,
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

// Recommended practice topics per category
const PRACTICE_TOPICS = {
  'Frontend': ['DOM Manipulation & Event Handling', 'React Hooks and State Management', 'CSS Layouts (Flexbox & Grid)', 'Web Performance Optimization', 'TypeScript Fundamentals'],
  'Backend': ['REST API Design & Best Practices', 'Database Indexing & Query Optimization', 'Authentication & Authorization (JWT/OAuth)', 'Error Handling & Middleware', 'Caching Strategies (Redis)'],
  'Fullstack': ['System Design Fundamentals', 'API Integration Patterns', 'Database Schema Design', 'Deployment & CI/CD Pipelines', 'Monorepo Management'],
  'Mobile': ['React Native Navigation', 'State Management (Redux/Zustand)', 'Native APIs & Permissions', 'App Performance Profiling', 'Offline-first Architecture'],
  'DevOps': ['Docker & Containerization', 'Kubernetes Orchestration', 'Infrastructure as Code (Terraform)', 'Monitoring & Logging (Prometheus/Grafana)', 'CI/CD Pipeline Design'],
  'Data Science': ['Data Cleaning & Feature Engineering', 'Model Evaluation Metrics', 'Pandas & NumPy Operations', 'Machine Learning Algorithms', 'SQL for Data Analysis'],
  'Behavioral': ['STAR Method Storytelling', 'Conflict Resolution Examples', 'Leadership & Ownership Stories', 'Failure & Learning Examples', 'Cross-team Collaboration'],
};

// Get skill gap analysis: compare user per-category scores vs ideal (10/10)
export const getSkillGap = async (req, res) => {
  try {
    const userId = req.user.id;

    // Aggregate average score per category across all completed sessions
    const categoryScores = await Question.aggregate([
      {
        $lookup: {
          from: 'sessions',
          localField: 'session',
          foreignField: '_id',
          as: 'sessionData'
        }
      },
      { $unwind: '$sessionData' },
      {
        $match: {
          'sessionData.user': new mongoose.Types.ObjectId(userId),
          'sessionData.status': 'completed',
          'feedback.score': { $exists: true, $ne: null },
          'answer': { $ne: '__SKIPPED__' }
        }
      },
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

    // If no data yet, return empty
    if (categoryScores.length === 0) {
      return res.status(200).json({ success: true, data: { skillGaps: [], hasData: false } });
    }

    // Compute gap from ideal (10) and sort by biggest gap first
    const skillGaps = categoryScores
      .map(c => ({
        category: c._id,
        avgScore: parseFloat(c.avgScore.toFixed(2)),
        gap: parseFloat((10 - c.avgScore).toFixed(2)),
        strengthPct: parseFloat(((c.avgScore / 10) * 100).toFixed(1)),
        count: c.count,
        recommendedTopics: (PRACTICE_TOPICS[c._id] || []).slice(0, 3)
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3); // Return top-3 weakest

    res.status(200).json({ success: true, data: { skillGaps, hasData: true } });
  } catch (error) {
    console.error('Skill Gap Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get advanced stats: Time-series, Percentile, Velocity
export const getAdvancedStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Time-series Progress (Last 10 completed sessions)
    const timeSeries = await Session.find({ user: userId, status: 'completed' })
      .sort({ completedAt: 1 })
      .limit(10)
      .select('score completedAt');

    // 2. Percentile Ranking
    // Get average score of current user
    const userAvgRes = await Session.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);
    const userAvg = userAvgRes[0]?.avg || 0;

    // Get average score across all users in the system
    const systemAvgRes = await Session.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);
    const systemAvg = systemAvgRes[0]?.avg || 0;

    // A simple percentile heuristic for now: 
    // (User Avg / System Avg) * 50 capped at 99. 
    // If userAvg is 8 and systemAvg is 6, they are roughly at 66th percentile.
    let percentile = systemAvg > 0 ? Math.min(99, Math.round((userAvg / (systemAvg * 1.5)) * 100)) : 50;
    if (userAvg === 0) percentile = 0;

    // 3. Skill Velocity (Improvement rate per session)
    let velocity = 0;
    if (timeSeries.length >= 2) {
      const firstScore = timeSeries[0].score;
      const lastScore = timeSeries[timeSeries.length - 1].score;
      velocity = parseFloat(((lastScore - firstScore) / timeSeries.length).toFixed(2));
    }

    // 4. Radar Chart Dimensions (Clarity, Depth, Relevance)
    const radarStats = await Question.aggregate([
      {
        $lookup: {
          from: 'sessions',
          localField: 'session',
          foreignField: '_id',
          as: 'sessionData'
        }
      },
      { $unwind: '$sessionData' },
      { 
        $match: { 
          'sessionData.user': new mongoose.Types.ObjectId(userId),
          'sessionData.status': 'completed',
          'feedback.score': { $exists: true, $ne: null }
        } 
      },
      {
        $group: {
          _id: null,
          avgClarity: { $avg: '$feedback.clarity' },
          avgDepth: { $avg: '$feedback.depth' },
          avgRelevance: { $avg: '$feedback.relevance' }
        }
      }
    ]);

    const stats = radarStats[0] || { avgClarity: 0, avgDepth: 0, avgRelevance: 0 };
    const radarData = [
      { subject: 'Clarity', A: stats.avgClarity || 0, fullMark: 10 },
      { subject: 'Depth', A: stats.avgDepth || 0, fullMark: 10 },
      { subject: 'Relevance', A: stats.avgRelevance || 0, fullMark: 10 },
      { subject: 'Structure', A: (stats.avgClarity + stats.avgDepth) / 2 || 0, fullMark: 10 },
      { subject: 'Communication', A: (stats.avgClarity + stats.avgRelevance) / 2 || 0, fullMark: 10 },
    ];

    res.status(200).json({
      success: true,
      data: {
        timeSeries,
        percentile,
        velocity,
        radarData
      }
    });
  } catch (error) {
    console.error('Advanced Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

