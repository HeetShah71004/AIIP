import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if role matches if provided
    if (role && user.role !== role) {
      return res.status(401).json({ success: false, error: `Invalid credentials for ${role} role` });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Google login
// @route   POST /api/v1/auth/google-login
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Please provide a Google ID token' });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    console.log('--- Google Login Debug ---');
    console.log('Payload keys:', Object.keys(payload));
    console.log('Name:', payload.name);
    console.log('Picture:', payload.picture);
    console.log('--- End Debug ---');
    
    const { sub, email, name } = payload;
    const picture = payload.picture || payload.photo || payload.avatar || payload.picture_url;

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { googleId: sub },
        { email: email }
      ]
    });

    if (user) {
      // Check if role matches if provided
      if (role && user.role !== role) {
        return res.status(401).json({ success: false, error: `Invalid credentials: You are registered as ${user.role}` });
      }

      // If user exists but doesn't have googleId (registered via email), link account
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = sub;
        needsSave = true;
      }
      // Always update avatar from Google to keep it current
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        role: role || 'candidate'
      });
      console.log('Created new user with avatar:', picture, 'and role:', role);
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ success: false, error: 'Invalid Google token' });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile by ID (Recruiter only)
// @route   GET /api/v1/auth/user/:id
// @access  Private (Recruiter)
export const getUserProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Create token
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  });

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    data: user
  });
};

// @desc    Invite a candidate via email
// @route   POST /api/v1/auth/invite-candidate
// @access  Private (Recruiter only)
export const inviteCandidate = async (req, res, next) => {
  try {
    const { email, customMessage } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide a candidate email' });
    }

    // Verify requester is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, error: 'Only recruiters can invite candidates' });
    }

    const { sendInvitationEmail } = await import('../services/emailService.js');
    
    const result = await sendInvitationEmail({
      to: email,
      recruiterName: req.user.name,
      customMessage
    });

    if (!result.sent) {
      return res.status(500).json({ success: false, error: result.message });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Schedule a mock interview for a candidate
// @route   POST /api/v1/auth/schedule-mock
// @access  Private (Recruiter only)
export const scheduleInterview = async (req, res, next) => {
  try {
    const { email, date, time, message } = req.body;

    if (!email || !date || !time) {
      return res.status(400).json({ success: false, error: 'Please provide email, date, and time' });
    }

    // Verify requester is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, error: 'Only recruiters can schedule interviews' });
    }

    const { sendScheduleEmail } = await import('../services/emailService.js');
    
    const result = await sendScheduleEmail({
      to: email,
      recruiterName: req.user.name,
      date,
      time,
      message
    });

    if (!result.sent) {
      return res.status(500).json({ success: false, error: result.message });
    }

    res.status(200).json({
      success: true,
      message: `Interview scheduled for ${new Date(date).toLocaleDateString()} at ${time}`
    });
  } catch (err) {
    next(err);
  }
};
