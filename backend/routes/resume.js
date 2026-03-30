import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  uploadResume, 
  getResume, 
  upsertResume, 
  emailResumeDraft,
  rewriteSection, 
  calculateATS,
  parseAndImportResume,
  getResumeThemeCatalog,
  syncResumeThemeCatalog
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Multer storage config
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
});

const uploadPdf = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const extname = path.extname(file.originalname).toLowerCase() === '.pdf';
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed'));
  }
});

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/import', protect, upload.single('resume'), parseAndImportResume);

router.route('/')
  .get(protect, getResume)
  .post(protect, upsertResume);

router.post('/email-draft', protect, uploadPdf.single('resumePdf'), emailResumeDraft);

router.post('/rewrite', protect, rewriteSection);
router.post('/ats-score', protect, calculateATS);
router.get('/themes', protect, getResumeThemeCatalog);
router.post('/themes/sync', protect, syncResumeThemeCatalog);

export default router;
