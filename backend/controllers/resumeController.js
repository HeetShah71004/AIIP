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

    // Dynamic parsing logic
    const skillsList = [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 
      'Express', 'Docker', 'AWS', 'TypeScript', 'HTML', 'CSS', 'Redux', 'GraphQL',
      'Flutter', 'Dart', 'Android', 'iOS', 'Firebase', 'JWT', 'RESTful API', 'Next.js',
      'Socket.io', 'Tailwind', 'Postman', 'Git', 'GitHub', 'C#', '.NET', 'Kotlin', 'Swift'
    ];
    
    const skillCounts = {};
    const foundSkills = skillsList.filter(skill => {
      // Escape special characters for regex
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, (match) => '\\' + match);
      // Custom boundary check
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapedSkill}(?![a-zA-Z0-9])`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        skillCounts[skill] = matches.length;
        return true;
      }
      return false;
    });

    // Find most used skill
    let primaryStack = 'General';
    if (Object.keys(skillCounts).length > 0) {
      primaryStack = Object.entries(skillCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    // Extract Developer Title (looking for "Developer", "Engineer" etc. in the first few lines)
    const titleMatch = text.match(/([a-zA-Z\s]+(?:Developer|Engineer|Architect|Consultant|Specialist))/i);
    const developerTitle = titleMatch ? titleMatch[1].trim() : 'Software Developer';

    // Basic projects extraction
    const projectsMatch = text.match(/(?:Projects|Recent Projects|Key Projects)([\s\S]*?)(?:Education|Skills|Links|$)/i);
    let projects = [];
    if (projectsMatch) {
      const projectsText = projectsMatch[1];
      // Try to split by numbers or bullet points
      const projectItems = projectsText.split(/(?:\n\s*\d+\.\s*|\n\s*[•\-]\s*)/)
        .filter(p => p.trim().length > 20 && !p.toLowerCase().includes('http') && !p.toLowerCase().includes('www'))
        .slice(0, 1);
      
      projects = projectItems.map(item => {
        const lines = item.trim().split('\n');
        // Clean name: remove numbers, symbols at start, and anything after | or :
        let name = lines[0].replace(/^[\d\s\.\•\-\*]+/, '').split(/[|:(]/)[0].trim();
        name = name.substring(0, 50);
        
        // Find languages used in this specific project text
        const projectTech = skillsList.filter(skill => {
          const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, (match) => '\\' + match);
          const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapedSkill}(?![a-zA-Z0-9])`, 'i');
          return regex.test(item);
        });

        return {
          name,
          languages: projectTech.slice(0, 4) // Show up to 4 main techs
        };
      });
    }

    // Basic education extraction
    const educationMatch = text.match(/(?:Education|Academic)([\s\S]*?)(?:Skills|Certifications|Links|$)/i);
    let education = [];
    if (educationMatch) {
      const eduText = educationMatch[1];
      const eduLines = eduText.split('\n').filter(line => line.trim().length > 10).slice(0, 2);
      education = eduLines.map(line => ({
        degree: line.trim().substring(0, 50),
        school: 'Extracted'
      }));
    }

    const parsedData = {
      developerTitle,
      primaryStack,
      skills: foundSkills.length > 0 ? foundSkills : ['General'],
      projects: projects.length > 0 ? projects : [{ name: 'Personal Project', languages: [primaryStack] }],
      education: education.length > 0 ? education : [{ degree: 'Degree', school: 'University' }]
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
