/**
 * Realistic Carbon Emission Factors (kg CO2)
 */
const EMISSION_FACTORS = {
  // Transportation (per km)
  transport: {
    bike: 0.11, // Average petrol bike/scooter
    car: {
      petrol: 0.18,
      diesel: 0.17,
      electric: 0.05,
      cng: 0.12
    },
    bus: 0.08, // Passenger-km average
    train: 0.04, // Passenger-km average
    flight: 0.15 // Short/medium haul flight passenger-km
  },

  // Electricity
  electricity: {
    perKwh: 0.82, // Standard grid factor (kg CO2 per kWh)
    acPerHour: 1.2, // ~1.5 ton AC uses 1.5 kWh/hr * 0.82 grid = 1.2 kg CO2
    fanPerHour: 0.05, // 60W fan * 0.82 = 0.05 kg CO2
    lightPerHour: 0.015 // 20W LED/CFL * 0.82 = 0.015 kg CO2
  },

  // Food (monthly baseline based on diet type)
  food: {
    diet: {
      vegan: 30, // kg CO2 per month
      vegetarian: 45,
      'non-veg': 90,
      'heavy-meat': 135
    },
    dairy: {
      low: 5,
      medium: 15,
      high: 30
    },
    fastFoodPerMeal: 1.5 // 1.5 kg CO2 per meal
  },

  // Internet & Devices (monthly based on hours/day)
  digital: {
    mobileHour: 0.015, // Mobile usage (network + device power) per hour
    laptopHour: 0.05, // Laptop usage per hour
    streamingHour: 0.18, // HD Video streaming (datacenter + network + device) per hour
    gamingHour: 0.3 // High-performance gaming PC/console per hour
  },

  // Fuel (household direct combustion)
  fuel: {
    lpgCylinder: 42.5, // 14.2kg standard cylinder = ~42.5 kg CO2
    coalPerKg: 2.42,
    woodPerKg: 1.83
  }
};

/**
 * Calculates emissions for all categories and returns breakdown + total
 * @param {Object} inputs Raw values entered by user
 * @returns {Object} { categories: { transportation, electricity, food, internet, fuel }, totalEmission }
 */
const calculateCarbonFootprint = (inputs) => {
  const trans = inputs.transportation || {};
  const elec = inputs.electricity || {};
  const fd = inputs.food || {};
  const net = inputs.internet || {};
  const fl = inputs.fuel || {};

  // 1. Transportation (Monthly estimation based on daily or weekly average inputs)
  // We assume distance is given in km per month (e.g. monthly travel distance)
  const carFactor = EMISSION_FACTORS.transport.car[trans.carFuel] || EMISSION_FACTORS.transport.car.petrol;
  const transportationEmission = 
    (Number(trans.bikeDist || 0) * EMISSION_FACTORS.transport.bike) +
    (Number(trans.carDist || 0) * carFactor) +
    (Number(trans.busDist || 0) * EMISSION_FACTORS.transport.bus) +
    (Number(trans.trainDist || 0) * EMISSION_FACTORS.transport.train) +
    (Number(trans.flightDist || 0) * EMISSION_FACTORS.transport.flight);

  // 2. Electricity
  // Primary: direct monthly units. Secondary: AC hours and count adjustments.
  const electricityEmission = 
    (Number(elec.monthlyUnits || 0) * EMISSION_FACTORS.electricity.perKwh) +
    (Number(elec.acHours || 0) * EMISSION_FACTORS.electricity.acPerHour * 30) + // hours/day * 30 days
    (Number(elec.fanCount || 0) * EMISSION_FACTORS.electricity.fanPerHour * 8 * 30) + // assuming 8 hrs/day
    (Number(elec.lightCount || 0) * EMISSION_FACTORS.electricity.lightPerHour * 6 * 30); // assuming 6 hrs/day

  // 3. Food
  const dietBase = EMISSION_FACTORS.food.diet[fd.dietType] || EMISSION_FACTORS.food.diet.vegetarian;
  const dairyAdd = EMISSION_FACTORS.food.dairy[fd.dairyLevel] || EMISSION_FACTORS.food.dairy.medium;
  const fastFoodAdd = Number(fd.fastFoodFreq || 0) * EMISSION_FACTORS.food.fastFoodPerMeal * 4.3; // meals/week * 4.3 weeks
  const foodEmission = dietBase + dairyAdd + fastFoodAdd;

  // 4. Internet & Devices (Monthly, inputs in hours per day)
  const internetEmission = 
    (Number(net.mobileHours || 0) * EMISSION_FACTORS.digital.mobileHour * 30) +
    (Number(net.laptopHours || 0) * EMISSION_FACTORS.digital.laptopHour * 30) +
    (Number(net.streamingHours || 0) * EMISSION_FACTORS.digital.streamingHour * 30) +
    (Number(net.gamingHours || 0) * EMISSION_FACTORS.digital.gamingHour * 30);

  // 5. Fuel
  const fuelEmission = 
    (Number(fl.lpgCylinders || 0) * EMISSION_FACTORS.fuel.lpgCylinder) +
    (Number(fl.coalWeight || 0) * EMISSION_FACTORS.fuel.coalPerKg) +
    (Number(fl.woodWeight || 0) * EMISSION_FACTORS.fuel.woodPerKg);

  const categories = {
    transportation: Math.round(transportationEmission * 100) / 100,
    electricity: Math.round(electricityEmission * 100) / 100,
    food: Math.round(foodEmission * 100) / 100,
    internet: Math.round(internetEmission * 100) / 100,
    fuel: Math.round(fuelEmission * 100) / 100
  };

  const totalEmission = Math.round(
    (categories.transportation + categories.electricity + categories.food + categories.internet + categories.fuel) * 100
  ) / 100;

  return {
    categories,
    totalEmission
  };
};

module.exports = {
  EMISSION_FACTORS,
  calculateCarbonFootprint
};
