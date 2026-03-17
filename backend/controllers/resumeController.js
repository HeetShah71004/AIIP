import ResumeService from '../services/resumeService.js';
import Session from '../models/Session.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// @desc    Upload resume and extract text
// @route   POST /api/v1/resume/upload
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const buffer = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let text = '';
    if (fileExtension === '.pdf') {
      text = await ResumeService.extractFromPDF(buffer);
    } else if (fileExtension === '.docx') {
      text = await ResumeService.extractFromDOCX(buffer);
    }

    // Upload to Cloudinary
    const filename = `${Date.now()}${fileExtension}`;
    const cloudinaryResult = await uploadToCloudinary(buffer, filename);
    const resumeUrl = cloudinaryResult.secure_url;

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
      resumeUrl: resumeUrl,
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
