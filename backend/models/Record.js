const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  totalEmission: {
    type: Number,
    required: true
  },
  categories: {
    transportation: {
      type: Number,
      default: 0
    },
    electricity: {
      type: Number,
      default: 0
    },
    food: {
      type: Number,
      default: 0
    },
    internet: {
      type: Number,
      default: 0
    },
    fuel: {
      type: Number,
      default: 0
    }
  },
  inputs: {
    // Stores the raw input metrics to allow editing or rebuilding calculations
    transportation: {
      bikeDist: { type: Number, default: 0 },
      carDist: { type: Number, default: 0 },
      carFuel: { type: String, default: 'petrol' },
      busDist: { type: Number, default: 0 },
      trainDist: { type: Number, default: 0 },
      flightDist: { type: Number, default: 0 }
    },
    electricity: {
      monthlyUnits: { type: Number, default: 0 },
      acHours: { type: Number, default: 0 },
      fanCount: { type: Number, default: 0 },
      lightCount: { type: Number, default: 0 }
    },
    food: {
      dietType: { type: String, default: 'vegetarian' }, // veg, non-veg, vegan, heavy-meat
      dairyLevel: { type: String, default: 'medium' }, // low, medium, high
      fastFoodFreq: { type: Number, default: 0 } // meals per week
    },
    internet: {
      mobileHours: { type: Number, default: 0 },
      laptopHours: { type: Number, default: 0 },
      streamingHours: { type: Number, default: 0 },
      gamingHours: { type: Number, default: 0 }
    },
    fuel: {
      lpgCylinders: { type: Number, default: 0 }, // per month
      coalWeight: { type: Number, default: 0 }, // kg
      woodWeight: { type: Number, default: 0 } // kg
    }
  }
});

module.exports = mongoose.model('Record', RecordSchema);
const User = require('./User');

// Update environmental score and badges on user model when a new record is saved
RecordSchema.post('save', async function() {
  try {
    const Record = mongoose.model('Record');
    const records = await Record.find({ user: this.user }).sort({ date: -1 }).limit(5);
    
    if (records.length === 0) return;
    
    // Average of last few records
    const totalAvg = records.reduce((acc, r) => acc + r.totalEmission, 0) / records.length;
    
    // Calculate environmental score (100 is optimal, subtract proportional to average emission)
    // Average monthly emission of standard person is around 400-500 kg CO2.
    // Score = max(0, min(100, Math.round(100 - (totalAvg / 8))))
    let newScore = Math.max(0, Math.min(100, Math.round(100 - (totalAvg / 8))));
    
    // Update user record
    const user = await User.findById(this.user);
    if (user) {
      let habitBonus = 0;
      if (user.completedHabits && Array.isArray(user.completedHabits)) {
        user.completedHabits.forEach(hId => {
          if (hId === 'h1') habitBonus += 5;
          else if (hId === 'h2') habitBonus += 3;
          else if (hId === 'h3') habitBonus += 5;
          else if (hId === 'h4') habitBonus += 2;
          else if (hId === 'h5') habitBonus += 2;
          else if (hId === 'h6') habitBonus += 3;
        });
      }

      const finalScore = Math.min(100, newScore + habitBonus);
      user.environmentalScore = finalScore;
      
      // Update badges logic
      const badges = ['Eco Novice'];
      if (finalScore >= 85) badges.push('Carbon Zero Hero');
      else if (finalScore >= 70) badges.push('Eco Warrior');
      else if (finalScore >= 50) badges.push('Green Commuter');
      
      if (records.length >= 10 || (user.completedHabits && user.completedHabits.length >= 4)) {
        badges.push('Climate Guardian');
      }
      if (this.totalEmission < 150 || (user.completedHabits && user.completedHabits.length >= 5)) {
        badges.push('Low Carbon Champion');
      }
      
      // De-duplicate badges
      user.badges = [...new Set(badges)];
      await user.save();
    }
  } catch (err) {
    console.error('Error updating user environmental score post-save:', err);
  }
});
