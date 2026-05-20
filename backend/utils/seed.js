require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Record = require('../models/Record');

const usersToSeed = [
  {
    username: 'admin',
    email: 'admin@carbon.com',
    password: 'admin123', // Will be hashed in pre-save hook
    role: 'admin',
    environmentalScore: 92,
    badges: ['Eco Novice', 'Eco Warrior', 'Carbon Zero Hero']
  },
  {
    username: 'niles',
    email: 'niles@carbon.com',
    password: 'password123',
    role: 'user',
    environmentalScore: 78,
    badges: ['Eco Novice', 'Green Commuter']
  },
  {
    username: 'aarav_green',
    email: 'aarav@green.com',
    password: 'password123',
    role: 'user',
    environmentalScore: 89,
    badges: ['Eco Novice', 'Eco Warrior', 'Carbon Zero Hero', 'Low Carbon Champion']
  },
  {
    username: 'priya_eco',
    email: 'priya@eco.com',
    password: 'password123',
    role: 'user',
    environmentalScore: 62,
    badges: ['Eco Novice', 'Green Commuter']
  },
  {
    username: 'carbon_collector',
    email: 'collector@carbon.com',
    password: 'password123',
    role: 'user',
    environmentalScore: 35,
    badges: ['Eco Novice']
  }
];

const seedData = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/carbon_emission_calculator';
    console.log(`Connecting to MongoDB at ${dbUri}...`);
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing old database records...');
    await User.deleteMany({});
    await Record.deleteMany({});
    console.log('Database cleared.');

    // Seed Users
    console.log('Seeding users...');
    const createdUsers = [];
    for (const u of usersToSeed) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Successfully seeded ${createdUsers.length} users.`);

    // Find Niles
    const nilesUser = createdUsers.find(u => u.username === 'niles');
    const aaravUser = createdUsers.find(u => u.username === 'aarav_green');
    const priyaUser = createdUsers.find(u => u.username === 'priya_eco');
    const collectorUser = createdUsers.find(u => u.username === 'carbon_collector');

    // Generate historical records for Niles over 6 months
    console.log('Generating historical records for users...');
    const records = [];

    const monthsAgo = (count) => {
      const d = new Date();
      d.setMonth(d.getMonth() - count);
      return d;
    };

    // Niles history (improving footprint month over month)
    const nilesRecords = [
      {
        user: nilesUser._id,
        date: monthsAgo(5),
        totalEmission: 520.4,
        categories: { transportation: 220, electricity: 180, food: 70, internet: 15.4, fuel: 35 },
        inputs: {
          transportation: { bikeDist: 200, carDist: 1000, carFuel: 'petrol', busDist: 50, trainDist: 0, flightDist: 0 },
          electricity: { monthlyUnits: 200, acHours: 2, fanCount: 3, lightCount: 8 },
          food: { dietType: 'non-veg', dairyLevel: 'high', fastFoodFreq: 3 },
          internet: { mobileHours: 4, laptopHours: 6, streamingHours: 3, gamingHours: 1 },
          fuel: { lpgCylinders: 0.8, coalWeight: 0, woodWeight: 0 }
        }
      },
      {
        user: nilesUser._id,
        date: monthsAgo(4),
        totalEmission: 480.2,
        categories: { transportation: 190, electricity: 170, food: 70, internet: 15.2, fuel: 35 },
        inputs: {
          transportation: { bikeDist: 180, carDist: 850, carFuel: 'petrol', busDist: 80, trainDist: 0, flightDist: 0 },
          electricity: { monthlyUnits: 190, acHours: 1.5, fanCount: 3, lightCount: 8 },
          food: { dietType: 'non-veg', dairyLevel: 'high', fastFoodFreq: 2 },
          internet: { mobileHours: 4, laptopHours: 5, streamingHours: 3, gamingHours: 1 },
          fuel: { lpgCylinders: 0.8, coalWeight: 0, woodWeight: 0 }
        }
      },
      {
        user: nilesUser._id,
        date: monthsAgo(3),
        totalEmission: 395.5,
        categories: { transportation: 120, electricity: 155, food: 55, internet: 14.5, fuel: 51 },
        inputs: {
          transportation: { bikeDist: 150, carDist: 500, carFuel: 'diesel', busDist: 120, trainDist: 40, flightDist: 0 },
          electricity: { monthlyUnits: 170, acHours: 1.0, fanCount: 3, lightCount: 8 },
          food: { dietType: 'vegetarian', dairyLevel: 'medium', fastFoodFreq: 2 },
          internet: { mobileHours: 3, laptopHours: 6, streamingHours: 2, gamingHours: 1 },
          fuel: { lpgCylinders: 1.2, coalWeight: 0, woodWeight: 0 }
        }
      },
      {
        user: nilesUser._id,
        date: monthsAgo(2),
        totalEmission: 320.1,
        categories: { transportation: 85, electricity: 140, food: 45, internet: 12.6, fuel: 37.5 },
        inputs: {
          transportation: { bikeDist: 100, carDist: 300, carFuel: 'cng', busDist: 200, trainDist: 100, flightDist: 0 },
          electricity: { monthlyUnits: 150, acHours: 0.5, fanCount: 2, lightCount: 6 },
          food: { dietType: 'vegetarian', dairyLevel: 'medium', fastFoodFreq: 1 },
          internet: { mobileHours: 3, laptopHours: 5, streamingHours: 2, gamingHours: 0.5 },
          fuel: { lpgCylinders: 0.8, coalWeight: 0, woodWeight: 0 }
        }
      },
      {
        user: nilesUser._id,
        date: monthsAgo(1),
        totalEmission: 245.8,
        categories: { transportation: 45, electricity: 120, food: 35, internet: 10.8, fuel: 35 },
        inputs: {
          transportation: { bikeDist: 50, carDist: 100, carFuel: 'electric', busDist: 250, trainDist: 150, flightDist: 0 },
          electricity: { monthlyUnits: 130, acHours: 0, fanCount: 2, lightCount: 6 },
          food: { dietType: 'vegan', dairyLevel: 'low', fastFoodFreq: 0.5 },
          internet: { mobileHours: 2.5, laptopHours: 4, streamingHours: 1.5, gamingHours: 0 },
          fuel: { lpgCylinders: 0.8, coalWeight: 0, woodWeight: 0 }
        }
      }
    ];

    // Other user records (to generate overall database variety)
    const extraRecords = [
      {
        user: aaravUser._id,
        date: monthsAgo(1),
        totalEmission: 138.5,
        categories: { transportation: 20, electricity: 68, food: 35, internet: 7.5, fuel: 8 },
        inputs: {
          transportation: { bikeDist: 0, carDist: 0, carFuel: 'electric', busDist: 100, trainDist: 200, flightDist: 0 },
          electricity: { monthlyUnits: 80, acHours: 0, fanCount: 1, lightCount: 4 },
          food: { dietType: 'vegan', dairyLevel: 'low', fastFoodFreq: 0 },
          internet: { mobileHours: 2, laptopHours: 3, streamingHours: 1, gamingHours: 0 },
          fuel: { lpgCylinders: 0.2, coalWeight: 0, woodWeight: 0 }
        }
      },
      {
        user: priyaUser._id,
        date: monthsAgo(1),
        totalEmission: 355.2,
        categories: { transportation: 110, electricity: 135, food: 60, internet: 15.2, fuel: 35 },
        inputs: {
          transportation: { bikeDist: 120, carDist: 400, carFuel: 'petrol', busDist: 100, trainDist: 0, flightDist: 0 },
          electricity: { monthlyUnits: 150, acHours: 0.8, fanCount: 2, lightCount: 8 },
          food: { dietType: 'vegetarian', dairyLevel: 'medium', fastFoodFreq: 3 },
          internet: { mobileHours: 4, laptopHours: 5, streamingHours: 3, gamingHours: 1 },
          fuel: { lpgCylinders: 0.8, coalWeight: 0, woodWeight: 0 }
        }
      },
      {
        user: collectorUser._id,
        date: monthsAgo(1),
        totalEmission: 825.6,
        categories: { transportation: 450, electricity: 210, food: 110, internet: 20.6, fuel: 35 },
        inputs: {
          transportation: { bikeDist: 0, carDist: 2200, carFuel: 'petrol', busDist: 0, trainDist: 0, flightDist: 0 },
          electricity: { monthlyUnits: 230, acHours: 2.5, fanCount: 4, lightCount: 10 },
          food: { dietType: 'heavy-meat', dairyLevel: 'high', fastFoodFreq: 5 },
          internet: { mobileHours: 5, laptopHours: 8, streamingHours: 4, gamingHours: 2 },
          fuel: { lpgCylinders: 0.8, coalWeight: 0, woodWeight: 0 }
        }
      }
    ];

    const allRecordsToSeed = [...nilesRecords, ...extraRecords];
    
    for (const r of allRecordsToSeed) {
      const rec = new Record(r);
      await rec.save();
    }
    console.log(`Successfully seeded ${allRecordsToSeed.length} historical carbon records.`);
    
    // Explicitly check and run post-hooks logic by triggering updates
    console.log('Calculating environmental scores...');
    
    for (const u of createdUsers) {
      const records = await Record.find({ user: u._id }).sort({ date: -1 }).limit(5);
      if (records.length > 0) {
        const totalAvg = records.reduce((acc, r) => acc + r.totalEmission, 0) / records.length;
        let newScore = Math.max(0, Math.min(100, Math.round(100 - (totalAvg / 8))));
        
        // Badges update
        const badges = ['Eco Novice'];
        if (newScore >= 85) badges.push('Carbon Zero Hero');
        else if (newScore >= 70) badges.push('Eco Warrior');
        else if (newScore >= 50) badges.push('Green Commuter');
        
        if (records.length >= 5) badges.push('Climate Guardian');
        if (records.some(r => r.totalEmission < 150)) badges.push('Low Carbon Champion');
        
        u.environmentalScore = newScore;
        u.badges = [...new Set(badges)];
        await u.save();
      }
    }
    console.log('User environmental scores and badges synchronized.');
    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
