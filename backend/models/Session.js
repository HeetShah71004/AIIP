import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sessionType: {
    type: String,
    enum: ['mock', 'peer'],
    default: 'mock'
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
    enum: ['pending', 'completed', 'open', 'matched', 'booked', 'cancelled'],
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
  interviewRound: String,
  difficultyRating: {
    type: Number,
    default: 1400
  },
  difficultyConfig: {
    ceiling: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Hard'
    },
    floor: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy'
    }
  },
  peerInterview: {
    hostUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    guestUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      trim: true,
      maxlength: 80
    },
    level: {
      type: String,
      trim: true,
      maxlength: 40
    },
    topic: {
      type: String,
      trim: true,
      maxlength: 120
    },
    timezone: {
      type: String,
      trim: true,
      default: 'UTC'
    },
    startAt: Date,
    endAt: Date,
    meetingProvider: {
      type: String,
      trim: true,
      default: 'internal'
    },
    meetingJoinUrl: {
      type: String,
      trim: true
    },
    calendarEventId: {
      type: String,
      trim: true
    },
    reminderState: {
      oneDaySent: {
        type: Boolean,
        default: false
      },
      oneHourSent: {
        type: Boolean,
        default: false
      },
      lastSentAt: Date
    }
  }
});

sessionSchema.index({ sessionType: 1, status: 1, 'peerInterview.startAt': 1 });

export default mongoose.model('Session', sessionSchema);
