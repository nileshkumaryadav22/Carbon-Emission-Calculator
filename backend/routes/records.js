const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { calculateCarbonFootprint } = require('../utils/calculations');
const nodemailer = require('nodemailer');

/**
 * @route   POST /api/records
 * @desc    Calculate and save a new carbon emission record
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!inputs) {
      return res.status(400).json({ success: false, message: 'Please provide inputs for calculations' });
    }

    // Run emission math
    const { categories, totalEmission } = calculateCarbonFootprint(inputs);

    // Save record to DB
    const record = new Record({
      user: req.user._id,
      totalEmission,
      categories,
      inputs
    });

    await record.save();

    res.status(201).json({
      success: true,
      message: 'Carbon footprint saved successfully!',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/records/history
 * @desc    Get user's carbon emission records history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const records = await Record.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/records/:id
 * @desc    Delete a carbon record
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await Record.findById(id = req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Check ownership
    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this record' });
    }

    await record.deleteOne();

    // Trigger recalculation of user score post-deletion by creating a temporary post-hook effect
    const User = require('../models/User');
    const userRecords = await Record.find({ user: record.user }).sort({ date: -1 }).limit(5);
    let newScore = 100;
    if (userRecords.length > 0) {
      const totalAvg = userRecords.reduce((acc, r) => acc + r.totalEmission, 0) / userRecords.length;
      newScore = Math.max(0, Math.min(100, Math.round(100 - (totalAvg / 8))));
    }
    
    await User.findByIdAndUpdate(record.user, { environmentalScore: newScore });

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/records/stats
 * @desc    Get aggregated stats for dashboard (past 6 months)
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's records
    const records = await Record.find({ user: userId }).sort({ date: 1 });

    // Category summary (average of user records)
    const categoryTotals = { transportation: 0, electricity: 0, food: 0, internet: 0, fuel: 0 };
    let recordCount = records.length;

    records.forEach(r => {
      categoryTotals.transportation += r.categories.transportation || 0;
      categoryTotals.electricity += r.categories.electricity || 0;
      categoryTotals.food += r.categories.food || 0;
      categoryTotals.internet += r.categories.internet || 0;
      categoryTotals.fuel += r.categories.fuel || 0;
    });

    const categoryAverages = {};
    Object.keys(categoryTotals).forEach(cat => {
      categoryAverages[cat] = recordCount > 0 ? Math.round((categoryTotals[cat] / recordCount) * 100) / 100 : 0;
    });

    // Monthly trends (group by last 6 months)
    const monthlyTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthNum = d.getMonth();
      const yearNum = d.getFullYear();
      const monthName = months[monthNum] + ' ' + String(yearNum).slice(-2);

      // Find records in this month
      const startOfMonth = new Date(yearNum, monthNum, 1);
      const endOfMonth = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);

      const monthRecords = records.filter(r => r.date >= startOfMonth && r.date <= endOfMonth);
      const sum = monthRecords.reduce((acc, r) => acc + r.totalEmission, 0);
      const avg = monthRecords.length > 0 ? Math.round((sum / monthRecords.length) * 100) / 100 : 0;

      monthlyTrends.push({
        month: monthName,
        emissions: avg,
        count: monthRecords.length
      });
    }

    // Global Average carbon footprint for comparison
    const allRecords = await Record.find({});
    const globalTotal = allRecords.reduce((acc, r) => acc + r.totalEmission, 0);
    const globalAverage = allRecords.length > 0 ? Math.round((globalTotal / allRecords.length) * 100) / 100 : 450; // Default placeholder average

    // Current month average for current user
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthRecords = records.filter(r => r.date >= startOfCurrentMonth);
    const userCurrentMonthTotal = currentMonthRecords.reduce((acc, r) => acc + r.totalEmission, 0);
    const userCurrentMonthAvg = currentMonthRecords.length > 0 ? Math.round((userCurrentMonthTotal / currentMonthRecords.length) * 100) / 100 : (records.length > 0 ? records[records.length - 1].totalEmission : 0);

    res.json({
      success: true,
      categoryAverages,
      monthlyTrends,
      comparison: {
        userAverage: recordCount > 0 ? Math.round((records.reduce((acc, r) => acc + r.totalEmission, 0) / recordCount) * 100) / 100 : 0,
        userCurrentMonth: userCurrentMonthAvg,
        globalAverage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/records/leaderboard
 * @desc    Get user leaderboard by environmentalScore
 * @access  Private
 */
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('username environmentalScore badges')
      .sort({ environmentalScore: -1 })
      .limit(10);
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/records/email-report
 * @desc    Email carbon emission report to user
 * @access  Private
 */
router.post('/email-report', protect, async (req, res) => {
  try {
    const { email, reportHTML, summaryText } = req.body;

    if (!email || !reportHTML) {
      return res.status(400).json({ success: false, message: 'Please provide email and report details' });
    }

    // Configure Mail Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Carbon Emission Calculator" <${process.env.EMAIL_USER || 'noreply@carbonfootprint.com'}>`,
      to: email,
      subject: 'Your Environmental Impact & Carbon Footprint Report',
      text: summaryText || 'Here is your monthly carbon footprint analysis.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Carbon Emission Calculator Report</h2>
          <p>Hello,</p>
          <p>Thank you for using the <strong>Carbon Emission Calculator</strong>. Here is your recent footprint evaluation and sustainability breakdown:</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            ${reportHTML}
          </div>
          <p>Keep tracking your emissions to watch your score improve. Remember, small steps lead to big environmental changes!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <footer style="font-size: 12px; color: #64748b; text-align: center;">
            <p>Carbon Emission Calculator &copy; ${new Date().getFullYear()}</p>
            <p>College Major Project &bull; Placement Ready Implementation</p>
          </footer>
        </div>
      `
    };

    // Attempt sending or simulate
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_USER.includes('your_email')) {
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Report sent successfully to ' + email });
    } else {
      console.log('--- EMAIL SIMULATION START ---');
      console.log('To:', email);
      console.log('Subject:', mailOptions.subject);
      console.log('Content Summary:', summaryText);
      console.log('--- EMAIL SIMULATION END ---');
      
      res.json({
        success: true,
        simulated: true,
        message: 'Email service simulated! (To send actual emails, configure EMAIL_USER and EMAIL_PASS in backend/.env).'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending email: ' + error.message });
  }
});

module.exports = router;
