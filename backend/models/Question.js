import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'Session',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  answer: String,
  feedback: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Question', questionSchema);
