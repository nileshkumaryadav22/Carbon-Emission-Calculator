const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Record = require('../models/Record');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users on the platform
 * @access  Private/Admin
 */
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user and their associated records
 * @access  Private/Admin
 */
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if trying to delete own account
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cascade delete records
    await Record.deleteMany({ user: userId });

    // Delete user
    await user.deleteOne();

    res.json({ success: true, message: 'User and all associated carbon records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform-wide emission statistics
 * @access  Private/Admin
 */
router.get('/stats', protect, admin, async (req, res) => {
  try {
    // 1. Basic user stats
    const totalUsers = await User.countDocuments({});
    const adminCount = await User.countDocuments({ role: 'admin' });
    const standardUserCount = totalUsers - adminCount;

    // 2. Total record count
    const totalRecords = await Record.countDocuments({});

    // 3. Platform aggregates
    const allRecords = await Record.find({});
    
    let totalPlatformCO2 = 0;
    const totals = { transportation: 0, electricity: 0, food: 0, internet: 0, fuel: 0 };

    allRecords.forEach(r => {
      totalPlatformCO2 += r.totalEmission || 0;
      totals.transportation += r.categories.transportation || 0;
      totals.electricity += r.categories.electricity || 0;
      totals.food += r.categories.food || 0;
      totals.internet += r.categories.internet || 0;
      totals.fuel += r.categories.fuel || 0;
    });

    const averageFootprint = totalPlatformCO2 > 0 && totalRecords > 0 
      ? Math.round((totalPlatformCO2 / totalRecords) * 100) / 100 
      : 0;

    // Category distribution percentage
    const categoryDistribution = [];
    if (totalPlatformCO2 > 0) {
      Object.keys(totals).forEach(cat => {
        categoryDistribution.push({
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: Math.round((totals[cat] / totalPlatformCO2) * 1000) / 10,
          total: Math.round(totals[cat] * 100) / 100
        });
      });
    } else {
      categoryDistribution.push(
        { name: 'Transportation', value: 0, total: 0 },
        { name: 'Electricity', value: 0, total: 0 },
        { name: 'Food', value: 0, total: 0 },
        { name: 'Internet', value: 0, total: 0 },
        { name: 'Fuel', value: 0, total: 0 }
      );
    }

    // Determine the most polluting category
    let maxCategory = 'none';
    let maxVal = -1;
    Object.keys(totals).forEach(cat => {
      if (totals[cat] > maxVal) {
        maxVal = totals[cat];
        maxCategory = cat;
      }
    });

    // 4. Score distributions (count users in brackets)
    const scoreBrackets = {
      excellent: await User.countDocuments({ environmentalScore: { $gte: 85 } }), // 85-100
      good: await User.countDocuments({ environmentalScore: { $gte: 70, $lt: 85 } }), // 70-84
      average: await User.countDocuments({ environmentalScore: { $gte: 50, $lt: 70 } }), // 50-69
      poor: await User.countDocuments({ environmentalScore: { $lt: 50 } }) // Under 50
    };

    res.json({
      success: true,
      stats: {
        totalUsers,
        standardUserCount,
        adminCount,
        totalRecords,
        totalPlatformCO2: Math.round(totalPlatformCO2 * 100) / 100,
        averageFootprint,
        mostPollutingCategory: maxCategory.charAt(0).toUpperCase() + maxCategory.slice(1),
        categoryDistribution,
        scoreBrackets
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
