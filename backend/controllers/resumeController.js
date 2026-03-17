import ResumeService from '../services/resumeService.js';
import Session from '../models/Session.js';
import path from 'path';

// @desc    Upload resume and extract text
// @route   POST /api/v1/resume/upload
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    // Extraction logic would go here
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let text = '';
    if (fileExtension === '.pdf') {
      text = await ResumeService.extractFromPDF(filePath);
    } else if (fileExtension === '.docx') {
      text = await ResumeService.extractFromDOCX(filePath);
    }

    // Mock parsing for now (in a real app, use AI or regex)
    const parsedData = {
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [{ title: 'Developer', company: 'Tech Inc', duration: '2 years' }],
      education: [{ degree: 'B.S. CS', school: 'University' }]
    };

    // Create session
    const session = await Session.create({
      user: req.user.id,
      resumeText: text,
      resumeUrl: filePath, // In production, this would be an S3 URL
      parsedData
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
};
