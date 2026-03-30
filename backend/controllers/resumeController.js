import ResumeService from '../services/resumeService.js';
import { extractStructuredDataFromResume, rewriteResumeSection, analyzeResumeATS, parseResumeForBuilder } from '../services/aiService.js';
import { getThemeCatalog, syncThemeCatalog } from '../services/themeCatalogService.js';
import { sendResumeDraftEmail } from '../services/emailService.js';
import Session from '../models/Session.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
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

    let parsedData = {};
    try {
      // Use AI for intelligent parsing
      parsedData = await extractStructuredDataFromResume(text);
      console.log('AI Resume Parsing Success');
    } catch (err) {
      console.warn('AI Parsing failed, falling back to regex logic:', err.message);
      
      // Fallback: Regex-based parsing logic
      const skillsList = [
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 
        'Express', 'Docker', 'AWS', 'TypeScript', 'HTML', 'CSS', 'Redux', 'GraphQL',
        'Flutter', 'Dart', 'Android', 'iOS', 'Firebase', 'JWT', 'RESTful API', 'Next.js',
        'Socket.io', 'Tailwind', 'Postman', 'Git', 'GitHub', 'C#', '.NET', 'Kotlin', 'Swift'
      ];
      
      const skillCounts = {};
      const foundSkills = skillsList.filter(skill => {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, (match) => '\\' + match);
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapedSkill}(?![a-zA-Z0-9])`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          skillCounts[skill] = matches.length;
          return true;
        }
        return false;
      });

      let primaryStack = 'General';
      if (Object.keys(skillCounts).length > 0) {
        primaryStack = Object.entries(skillCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      }

      const titleMatch = text.match(/([a-zA-Z\s]+(?:Developer|Engineer|Architect|Consultant|Specialist))/i);
      const developerTitle = titleMatch ? titleMatch[1].trim() : 'Software Developer';

      const projectsMatch = text.match(/(?:Projects|Recent Projects|Key Projects)([\s\S]*?)(?:Education|Skills|Links|$)/i);
      let projects = [];
      if (projectsMatch) {
        const projectsText = projectsMatch[1];
        const projectItems = projectsText.split(/(?:\n\s*\d+\.\s*|\n\s*[•\-]\s*)/)
          .filter(p => p.trim().length > 20 && !p.toLowerCase().includes('http') && !p.toLowerCase().includes('www'))
          .slice(0, 1);
        
        projects = projectItems.map(item => {
          const lines = item.trim().split('\n');
          let name = lines[0].replace(/^[\d\s\.\•\-\*]+/, '').split(/[|:(]/)[0].trim();
          name = name.substring(0, 50);
          const projectTech = skillsList.filter(skill => {
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, (match) => '\\' + match);
            const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapedSkill}(?![a-zA-Z0-9])`, 'i');
            return regex.test(item);
          });
          return { name, languages: projectTech.slice(0, 4) };
        });
      }

      const educationMatch = text.match(/(?:Education|Academic)([\s\S]*?)(?:Skills|Certifications|Links|$)/i);
      let education = [];
      if (educationMatch) {
        const eduText = educationMatch[1];
        const eduLines = eduText.split('\n').filter(line => line.trim().length > 10).slice(0, 2);
        education = eduLines.map(line => ({ degree: line.trim().substring(0, 50), school: 'Extracted' }));
      }

      parsedData = {
        developerTitle,
        primaryStack,
        skills: foundSkills.length > 0 ? foundSkills : ['General'],
        projects: projects.length > 0 ? projects : [{ name: 'Personal Project', languages: [primaryStack] }],
        education: education.length > 0 ? education : [{ degree: 'Degree', school: 'University' }]
      };
    }

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

// @desc    Parse uploaded resume exclusively for Builder
// @route   POST /api/v1/resume/import
// @access  Private
export const parseAndImportResume = async (req, res, next) => {
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
    } else {
      text = buffer.toString('utf8');
    }

    if (!text.trim()) {
      return res.status(400).json({ success: false, error: 'Could not extract text from the file.' });
    }

    // Call the AI Service tailored for the Builder state
    const parsedData = await parseResumeForBuilder(text);

    res.status(200).json({
      success: true,
      data: parsedData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user resume
// @route   GET /api/v1/resume
// @access  Private
export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update user resume
// @route   POST /api/v1/resume
// @access  Private
export const upsertResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let resume = await Resume.findOne({ user: userId });

    const payload = { ...req.body };
    
    // Deeply remove immutable MongoDB fields to prevent MongoServerError during $set updates
    const stripImmutables = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(stripImmutables);
      } else if (obj && typeof obj === 'object') {
        delete obj._id;
        delete obj.__v;
        delete obj.createdAt;
        delete obj.updatedAt;
        Object.values(obj).forEach(stripImmutables);
      }
    };
    stripImmutables(payload);
    
    payload.user = userId;

    if (resume) {
      resume = await Resume.findOneAndUpdate(
        { user: userId },
        { $set: payload },
        { new: true, runValidators: true }
      );
    } else {
      resume = await Resume.create(payload);
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Email saved resume draft with uploaded preview PDF
// @route   POST /api/v1/resume/email-draft
// @access  Private
export const emailResumeDraft = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('email');
    const resume = await Resume.findOne({ user: userId });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found. Save draft before emailing.' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'Preview PDF file is required.' });
    }

    const recipientEmail = user?.email || resume?.personalInfo?.email;
    const filename = req.file.originalname || 'resume-draft.pdf';

    const emailMeta = await sendResumeDraftEmail({
      to: recipientEmail,
      resume,
      pdfBuffer: req.file.buffer,
      pdfFilename: filename
    });

    if (!emailMeta.sent) {
      return res.status(400).json({
        success: false,
        error: emailMeta.message,
        emailStatus: emailMeta.status
      });
    }

    res.status(200).json({
      success: true,
      message: emailMeta.message,
      emailStatus: emailMeta.status
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Rewrite resume section using AI
// @route   POST /api/v1/resume/rewrite
// @access  Private
export const rewriteSection = async (req, res, next) => {
  try {
    const { text, sectionType } = req.body;

    if (!text || !sectionType) {
      return res.status(400).json({ success: false, error: 'Please provide text and section type' });
    }

    const rewrittenText = await rewriteResumeSection(text, sectionType);

    res.status(200).json({
      success: true,
      data: rewrittenText
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Calculate ATS score using AI
// @route   POST /api/v1/resume/ats-score
// @access  Private
export const calculateATS = async (req, res, next) => {
  try {
    const { resumeData, targetKeywords } = req.body;

    if (!resumeData) {
      return res.status(400).json({ success: false, error: 'Please provide resume data' });
    }

    const analysis = await analyzeResumeATS(resumeData, targetKeywords);

    // Update resume with the new score if it exists
    await Resume.findOneAndUpdate(
      { user: req.user.id },
      { 
        atsScore: {
          ...analysis,
          lastAnalyzed: Date.now()
        } 
      }
    );

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get community theme catalog
// @route   GET /api/v1/resume/themes
// @access  Private
export const getResumeThemeCatalog = async (req, res, next) => {
  try {
    const { search = '', style = 'All', page = 1, limit = 60 } = req.query;
    const data = await getThemeCatalog({ search, style, page, limit });

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Force sync community theme catalog
// @route   POST /api/v1/resume/themes/sync
// @access  Private
export const syncResumeThemeCatalog = async (req, res, next) => {
  try {
    const data = await syncThemeCatalog({ force: true });

    res.status(200).json({
      success: true,
      data: {
        syncedAt: data.syncedAt,
        total: data.themes.length
      }
    });
  } catch (err) {
    next(err);
  }
};
