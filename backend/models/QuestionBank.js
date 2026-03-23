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
  type: {
    type: String,
    enum: ['Behavioral', 'Technical', 'Coding'],
    default: 'Behavioral'
  },
  codeTemplate: {
    type: String
  },
  roleLevel: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior', 'Staff']
  },
  interviewRound: {
    type: String,
    enum: ['Phone Screen', 'Technical', 'System Design', 'Behavioral', 'Coding']
  },
  companyTags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('QuestionBank', questionBankSchema);
