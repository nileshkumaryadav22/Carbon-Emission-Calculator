const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_carbon_calculator_key_123!', {
    expiresIn: '30d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Auto-promote specific emails to admin for convenience, or allow explicit admin request
    let userRole = role || 'user';
    if (email.toLowerCase().startsWith('admin@') || username.toLowerCase() === 'admin') {
      userRole = 'admin';
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: userRole
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          environmentalScore: user.environmentalScore,
          badges: user.badges,
          completedHabits: user.completedHabits || []
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        environmentalScore: user.environmentalScore,
        badges: user.badges,
        completedHabits: user.completedHabits || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile details
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          environmentalScore: user.environmentalScore,
          badges: user.badges,
          completedHabits: user.completedHabits || [],
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile / password
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        token: generateToken(updatedUser._id),
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          environmentalScore: updatedUser.environmentalScore,
          badges: updatedUser.badges,
          completedHabits: updatedUser.completedHabits || []
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/auth/habits
 * @desc    Save adopted green habits and recalculate score/badges
 * @access  Private
 */
router.put('/habits', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { habits } = req.body;
    if (!Array.isArray(habits)) {
      return res.status(400).json({ success: false, message: 'Habits must be an array' });
    }

    user.completedHabits = habits;

    // Recalculate score
    // 1. Get base score from records (using the same logic as Record schema)
    const Record = require('../models/Record');
    const records = await Record.find({ user: user._id }).sort({ date: -1 }).limit(5);
    
    let baseScore = 100;
    if (records.length > 0) {
      const totalAvg = records.reduce((acc, r) => acc + r.totalEmission, 0) / records.length;
      baseScore = Math.max(0, Math.min(100, Math.round(100 - (totalAvg / 8))));
    }

    // 2. Add habit bonus points:
    // h1 (Public Transport): +5
    // h2 (Maintain AC at 24°C): +3
    // h3 (Meatless Mondays): +5
    // h4 (Standby Switch Off): +2
    // h5 (Lower Video Stream): +2
    // h6 (LED Lightbulbs): +3
    let habitBonus = 0;
    habits.forEach(hId => {
      if (hId === 'h1') habitBonus += 5;
      else if (hId === 'h2') habitBonus += 3;
      else if (hId === 'h3') habitBonus += 5;
      else if (hId === 'h4') habitBonus += 2;
      else if (hId === 'h5') habitBonus += 2;
      else if (hId === 'h6') habitBonus += 3;
    });

    user.environmentalScore = Math.min(100, baseScore + habitBonus);

    // 3. Update badges
    const badges = ['Eco Novice'];
    if (user.environmentalScore >= 85) badges.push('Carbon Zero Hero');
    else if (user.environmentalScore >= 70) badges.push('Eco Warrior');
    else if (user.environmentalScore >= 50) badges.push('Green Commuter');

    if (records.length >= 10 || habits.length >= 4) {
      badges.push('Climate Guardian');
    }
    if (records.some(r => r.totalEmission < 150) || habits.length >= 5) {
      badges.push('Low Carbon Champion');
    }

    user.badges = [...new Set(badges)];
    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        environmentalScore: updatedUser.environmentalScore,
        badges: updatedUser.badges,
        completedHabits: updatedUser.completedHabits || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
