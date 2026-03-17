import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import mammoth from 'mammoth';

class ResumeService {
  static async extractFromPDF(buffer) {
    // Save original console functions
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Temporarily override to filter out the specific 'TT: undefined function' warning
    const filterWarning = (...args) => {
      const msg = args.join(' ');
      return msg.includes('Warning: TT: undefined function');
    };

    console.warn = function (...args) {
      if (!filterWarning(...args)) originalWarn.apply(console, args);
    };
    console.log = function (...args) {
      if (!filterWarning(...args)) originalLog.apply(console, args);
    };

    try {
      const data = await pdf(buffer);
      return data.text;
    } finally {
      // Always restore the original console functions
      console.warn = originalWarn;
      console.log = originalLog;
    }
  }

  static async extractFromDOCX(buffer) {
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value;
  }
}

export default ResumeService;
