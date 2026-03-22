import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  resumeText: String,
  resumeUrl: String,
  parsedData: {
    developerTitle: String,
    primaryStack: String,
    skills: [String],
    projects: [Object],
    education: [Object]
  },
  duration: {
    type: Number, // duration in seconds
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  completedQuestions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  company: String,
  roleLevel: String,
  interviewRound: String
});

export default mongoose.model('Session', sessionSchema);
