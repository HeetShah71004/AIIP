import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const hasSmtpConfig = () => {
  const hasServiceAuth = Boolean(process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasHostAuth = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
  return hasServiceAuth || hasHostAuth;
};

const createTransporter = () => {
  if (!hasSmtpConfig()) return null;

  if (process.env.SMTP_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const buildResumeSummaryHtml = (resume) => {
  const fullName = resume?.personalInfo?.fullName || 'Unnamed Candidate';
  const summary = resume?.summary || 'No professional summary provided.';
  const experienceCount = resume?.experience?.length || 0;
  const educationCount = resume?.education?.length || 0;
  const projectCount = resume?.projects?.length || 0;
  const skills = (resume?.skills || []).slice(0, 12).join(', ') || 'No skills listed';
  const template = resume?.selectedTemplate || 'classic';

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin: 0 0 10px;">Your Resume Draft Has Been Saved</h2>
      <p style="margin: 0 0 14px;">Hi ${fullName}, your latest resume draft was saved successfully.</p>

      <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #f8fafc;">
        <p style="margin: 0 0 8px;"><strong>Selected template:</strong> ${template}</p>
        <p style="margin: 0 0 8px;"><strong>Summary:</strong> ${summary}</p>
        <p style="margin: 0 0 8px;"><strong>Experience entries:</strong> ${experienceCount}</p>
        <p style="margin: 0 0 8px;"><strong>Education entries:</strong> ${educationCount}</p>
        <p style="margin: 0 0 8px;"><strong>Project entries:</strong> ${projectCount}</p>
        <p style="margin: 0;"><strong>Skills:</strong> ${skills}</p>
      </div>

      <p style="margin: 14px 0 0; color: #475569; font-size: 13px;">
        This is an automatic email from Interv AI Resume Builder.
      </p>
    </div>
  `;
};

const buildResumeSummaryText = (resume) => {
  const fullName = resume?.personalInfo?.fullName || 'Unnamed Candidate';
  const summary = resume?.summary || 'No professional summary provided.';
  const experienceCount = resume?.experience?.length || 0;
  const educationCount = resume?.education?.length || 0;
  const projectCount = resume?.projects?.length || 0;
  const skills = (resume?.skills || []).slice(0, 12).join(', ') || 'No skills listed';
  const template = resume?.selectedTemplate || 'classic';

  return [
    `Hi ${fullName},`,
    '',
    'Your resume draft was saved successfully.',
    '',
    `Selected template: ${template}`,
    `Summary: ${summary}`,
    `Experience entries: ${experienceCount}`,
    `Education entries: ${educationCount}`,
    `Project entries: ${projectCount}`,
    `Skills: ${skills}`,
    '',
    'This is an automatic email from Interv AI Resume Builder.'
  ].join('\n');
};

const safeFilename = (value) => {
  const base = (value || 'resume-draft').toString().trim().toLowerCase();
  const cleaned = base.replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned || 'resume-draft';
};

const buildResumePdfBuffer = (resume) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const personalInfo = resume?.personalInfo || {};
      const fullName = personalInfo.fullName || 'Unnamed Candidate';
      const role = resume?.summary ? resume.summary.split('\n')[0] : '';

      const ensureSpace = (minSpace = 80) => {
        if (doc.y > doc.page.height - minSpace) {
          doc.addPage();
        }
      };

      const sectionTitle = (title) => {
        ensureSpace(90);
        doc.moveDown(0.2);
        doc.font('Helvetica-Bold').fontSize(14).text(title);
        doc.moveTo(40, doc.y + 2).lineTo(doc.page.width - 40, doc.y + 2).strokeColor('#d1d5db').stroke();
        doc.moveDown(0.7);
      };

      doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text(fullName);
      if (role) {
        doc.font('Helvetica').fontSize(11).fillColor('#334155').text(role, { width: 520 });
      }

      const contactParts = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedIn,
        personalInfo.github,
        personalInfo.website
      ].filter(Boolean);

      if (contactParts.length > 0) {
        doc.moveDown(0.4);
        doc.font('Helvetica').fontSize(10).fillColor('#475569').text(contactParts.join(' | '), { width: 520 });
      }

      if (resume?.summary) {
        sectionTitle('Professional Summary');
        doc.font('Helvetica').fontSize(11).fillColor('#1e293b').text(resume.summary, { width: 520, lineGap: 2 });
      }

      if (Array.isArray(resume?.experience) && resume.experience.length > 0) {
        sectionTitle('Experience');
        resume.experience.forEach((exp) => {
          ensureSpace(120);
          const heading = [exp.role, exp.company].filter(Boolean).join(' - ');
          const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' to ');

          if (heading) {
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(heading, { width: 520 });
          }
          if (dates) {
            doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(dates, { width: 520 });
          }
          if (exp.description) {
            doc.moveDown(0.2);
            doc.font('Helvetica').fontSize(10.5).fillColor('#1e293b').text(exp.description, { width: 520, lineGap: 1.5 });
          }
          doc.moveDown(0.6);
        });
      }

      if (Array.isArray(resume?.education) && resume.education.length > 0) {
        sectionTitle('Education');
        resume.education.forEach((edu) => {
          ensureSpace(90);
          const title = [edu.degree, edu.school].filter(Boolean).join(' - ');
          const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' to ');

          if (title) {
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(title, { width: 520 });
          }
          if (dates) {
            doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(dates, { width: 520 });
          }
          if (edu.description) {
            doc.moveDown(0.2);
            doc.font('Helvetica').fontSize(10.5).fillColor('#1e293b').text(edu.description, { width: 520 });
          }
          doc.moveDown(0.6);
        });
      }

      if (Array.isArray(resume?.projects) && resume.projects.length > 0) {
        sectionTitle('Projects');
        resume.projects.forEach((project) => {
          ensureSpace(100);
          if (project.name) {
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(project.name, { width: 520 });
          }
          if (project.technologies?.length) {
            doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(`Tech: ${project.technologies.join(', ')}`, { width: 520 });
          }
          if (project.link) {
            doc.font('Helvetica').fontSize(10).fillColor('#2563eb').text(project.link, { width: 520 });
          }
          if (project.description) {
            doc.moveDown(0.2);
            doc.font('Helvetica').fontSize(10.5).fillColor('#1e293b').text(project.description, { width: 520 });
          }
          doc.moveDown(0.6);
        });
      }

      if (Array.isArray(resume?.skills) && resume.skills.length > 0) {
        sectionTitle('Skills');
        doc.font('Helvetica').fontSize(10.5).fillColor('#1e293b').text(resume.skills.join(', '), { width: 520 });
      }

      if (Array.isArray(resume?.languages) && resume.languages.length > 0) {
        sectionTitle('Languages');
        doc.font('Helvetica').fontSize(10.5).fillColor('#1e293b').text(resume.languages.join(', '), { width: 520 });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const sendResumeDraftEmail = async ({ to, resume, pdfBuffer, pdfFilename }) => {
  if (!to) {
    return { status: 'skipped', sent: false, message: 'Recipient email not available.' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { status: 'skipped', sent: false, message: 'SMTP is not configured on server.' };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const candidateName = resume?.personalInfo?.fullName || 'resume-draft';
  const resolvedPdfFilename = pdfFilename || `${safeFilename(candidateName)}-draft.pdf`;

  try {
    const resolvedPdfBuffer = pdfBuffer || await buildResumePdfBuffer(resume);

    await transporter.sendMail({
      from,
      to,
      subject: 'Interv AI - Resume Draft Saved',
      text: buildResumeSummaryText(resume),
      html: buildResumeSummaryHtml(resume),
      attachments: [
        {
          filename: resolvedPdfFilename,
          content: resolvedPdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    return { status: 'sent', sent: true, message: 'Resume draft emailed successfully with PDF attachment.' };
  } catch (error) {
    return { status: 'failed', sent: false, message: error.message || 'Failed to send resume email.' };
  }
};
