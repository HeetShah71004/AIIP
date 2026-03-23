import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'Session',
    required: true
  },
  questionBankId: {
    type: mongoose.Schema.ObjectId,
    ref: 'QuestionBank'
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Behavioral', 'Technical', 'Coding'],
    default: 'Behavioral'
  },
  codeTemplate: String,
  answer: String,
  feedback: {
    score: { type: Number, min: 0, max: 10 },
    clarity: { type: Number, min: 0, max: 10 },
    depth: { type: Number, min: 0, max: 10 },
    relevance: { type: Number, min: 0, max: 10 },
    analysis: String,
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
