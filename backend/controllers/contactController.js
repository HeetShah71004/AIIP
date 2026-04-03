import { sendContactFormEmail } from '../services/emailService.js';

// @desc    Submit contact form
// @route   POST /api/v1/contact/submit
// @access  Public
export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
       return res.status(400).json({
         success: false,
         error: 'Please provide all required fields (name, email, message).'
       });
    }

    const emailResult = await sendContactFormEmail({ name, email, message });

    if (!emailResult.sent && emailResult.status === 'failed') {
      return res.status(500).json({
        success: false,
        error: emailResult.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully.',
      emailStatus: emailResult.status
    });
  } catch (error) {
    next(error);
  }
};
