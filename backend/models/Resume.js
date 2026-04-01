import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    linkedIn: String,
    github: String,
    leetcode: String
  },
  summary: {
    type: String,
    default: ''
  },
  experience: [
    {
      company: String,
      role: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String
    }
  ],
  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      startDate: String,
      endDate: String,
      description: String
    }
  ],
  skills: [String],
  languages: [String],
  projects: [
    {
      name: String,
      description: String,
      link: String,
      technologies: [String]
    }
  ],
  atsScore: {
    score: Number,
    lastAnalyzed: Date,
    feedback: [String],
    missingKeywords: [String]
  },
  selectedTemplate: {
    type: String,
    default: 'classic'
  },
  previewSectionOrder: {
    type: [String],
    default: ['summary', 'experience', 'projects', 'education', 'skills', 'languages']
  },
  previewOrderSelection: {
    type: [String],
    default: []
  },
  customSections: [{
    id: String,
    title: String,
    icon: String,
    items: [{
      title: String,
      subtitle: String,
      date: String,
      description: String
    }]
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

resumeSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

resumeSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

export default mongoose.model('Resume', resumeSchema);
