import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Frontend', 'Backend', 'Fullstack', 'Mobile', 'DevOps', 'Data Science', 'Behavioral']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  companyTags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('QuestionBank', questionBankSchema);
