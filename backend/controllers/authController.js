const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const getErrorStatus = (error) => {
  if (error.code === 11000 || error.name === 'ValidationError') return 400;
  return 500;
};

const getErrorMessage = (error) => {
  if (error.code === 11000) return 'Email already registered';
  if (error.name === 'ValidationError') {
    const firstError = Object.values(error.errors || {})[0];
    return firstError?.message || 'Validation failed';
  }
  return error.message || 'Internal Server Error';
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(getErrorStatus(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to login right now'
    });
  }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + (15 * 60 * 1000));
    await user.save({ validateBeforeSave: false });

    const frontendBaseUrl = (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map(url => url.trim())
      .filter(Boolean)[0] || 'http://localhost:5173';

    return res.json({
      success: true,
      message: 'Password reset link generated successfully',
      resetUrl: `${frontendBaseUrl.replace(/\/$/, '')}/reset-password/${resetToken}`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to generate reset link'
    });
  }
};

// @POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    return res.status(getErrorStatus(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, preferences },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(getErrorStatus(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getMe, updateProfile };
