import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Zap, 
  Utensils, 
  Globe, 
  Flame, 
  ArrowRight, 
  Save, 
  RefreshCw,
  PlusCircle
} from 'lucide-react';

const Calculator = () => {
  const { reloadProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transport');
  const [loading, setLoading] = useState(false);

  // Raw State inputs
  const [inputs, setInputs] = useState({
    transportation: {
      bikeDist: 0,
      carDist: 0,
      carFuel: 'petrol',
      busDist: 0,
      trainDist: 0,
      flightDist: 0
    },
    electricity: {
      monthlyUnits: 0,
      acHours: 0,
      fanCount: 0,
      lightCount: 0
    },
    food: {
      dietType: 'vegetarian',
      dairyLevel: 'medium',
      fastFoodFreq: 0
    },
    internet: {
      mobileHours: 0,
      laptopHours: 0,
      streamingHours: 0,
      gamingHours: 0
    },
    fuel: {
      lpgCylinders: 0,
      coalWeight: 0,
      woodWeight: 0
    }
  });

  // Real-time calculations breakdown
  const [liveBreakdown, setLiveBreakdown] = useState({
    transportation: 0,
    electricity: 0,
    food: 0,
    internet: 0,
    fuel: 0,
    total: 0
  });

  // Calculate live breakdown on frontend whenever inputs change
  useEffect(() => {
    // 1. Transportation
    const bikeFactor = 0.11;
    const carFactors = { petrol: 0.18, diesel: 0.17, electric: 0.05, cng: 0.12 };
    const busFactor = 0.08;
    const trainFactor = 0.04;
    const flightFactor = 0.15;

    const tInputs = inputs.transportation;
    const carFactor = carFactors[tInputs.carFuel] || 0.18;
    const transportEmission = 
      (tInputs.bikeDist * bikeFactor) +
      (tInputs.carDist * carFactor) +
      (tInputs.busDist * busFactor) +
      (tInputs.trainDist * trainFactor) +
      (tInputs.flightDist * flightFactor);

    // 2. Electricity
    const gridFactor = 0.82;
    const acFactor = 1.2;
    const fanFactor = 0.05;
    const lightFactor = 0.015;

    const eInputs = inputs.electricity;
    const electricityEmission = 
      (eInputs.monthlyUnits * gridFactor) +
      (eInputs.acHours * acFactor * 30) +
      (eInputs.fanCount * fanFactor * 8 * 30) +
      (eInputs.lightCount * lightFactor * 6 * 30);

    // 3. Food
    const dietFactors = { vegan: 30, vegetarian: 45, 'non-veg': 90, 'heavy-meat': 135 };
    const dairyFactors = { low: 5, medium: 15, high: 30 };
    const fastFoodPerMeal = 1.5;

    const fInputs = inputs.food;
    const foodEmission = 
      (dietFactors[fInputs.dietType] || 45) +
      (dairyFactors[fInputs.dairyLevel] || 15) +
      (fInputs.fastFoodFreq * fastFoodPerMeal * 4.3);

    // 4. Digital
    const mobileHourFactor = 0.015;
    const laptopHourFactor = 0.05;
    const streamingHourFactor = 0.18;
    const gamingHourFactor = 0.3;

    const dInputs = inputs.internet;
    const digitalEmission = 
      (dInputs.mobileHours * mobileHourFactor * 30) +
      (dInputs.laptopHours * laptopHourFactor * 30) +
      (dInputs.streamingHours * streamingHourFactor * 30) +
      (dInputs.gamingHours * gamingHourFactor * 30);

    // 5. Fuel
    const lpgCylinderFactor = 42.5;
    const coalFactor = 2.42;
    const woodFactor = 1.83;

    const flInputs = inputs.fuel;
    const fuelEmission = 
      (flInputs.lpgCylinders * lpgCylinderFactor) +
      (flInputs.coalWeight * coalFactor) +
      (flInputs.woodWeight * woodFactor);

    const breakdown = {
      transportation: Math.round(transportEmission * 100) / 100,
      electricity: Math.round(electricityEmission * 100) / 100,
      food: Math.round(foodEmission * 100) / 100,
      internet: Math.round(digitalEmission * 100) / 100,
      fuel: Math.round(fuelEmission * 100) / 100
    };

    breakdown.total = Math.round(
      (breakdown.transportation + breakdown.electricity + breakdown.food + breakdown.internet + breakdown.fuel) * 100
    ) / 100;

    setLiveBreakdown(breakdown);
  }, [inputs]);

  // Nested input change helper
  const handleNestedChange = (category, field, value) => {
    setInputs(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.post('/records', { inputs });
      if (res.data.success) {
        showToast('Carbon record logged successfully!', 'success');
        reloadProfile();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving record:', error);
      showToast(error.response?.data?.message || 'Error saving carbon entry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetInputs = () => {
    setInputs({
      transportation: { bikeDist: 0, carDist: 0, carFuel: 'petrol', busDist: 0, trainDist: 0, flightDist: 0 },
      electricity: { monthlyUnits: 0, acHours: 0, fanCount: 0, lightCount: 0 },
      food: { dietType: 'vegetarian', dairyLevel: 'medium', fastFoodFreq: 0 },
      internet: { mobileHours: 0, laptopHours: 0, streamingHours: 0, gamingHours: 0 },
      fuel: { lpgCylinders: 0, coalWeight: 0, woodWeight: 0 }
    });
    showToast('Calculator fields reset!', 'info');
  };

  const tabs = [
    { id: 'transport', name: 'Transportation', icon: <Car className="h-4.5 w-4.5" /> },
    { id: 'electricity', name: 'Electricity', icon: <Zap className="h-4.5 w-4.5" /> },
    { id: 'food', name: 'Food / Diet', icon: <Utensils className="h-4.5 w-4.5" /> },
    { id: 'internet', name: 'Digital & Devices', icon: <Globe className="h-4.5 w-4.5" /> },
    { id: 'fuel', name: 'Household Fuels', icon: <Flame className="h-4.5 w-4.5" /> }
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto space-y-6">
      {/* Page Title Header */}
      <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">Carbon Footprint Calculator</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Log your consumption metrics and see your direct estimated carbon footprint in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetInputs}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Inputs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Input Forms (Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm overflow-hidden flex flex-col">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200/20 dark:border-slate-800/20 bg-slate-50/50 dark:bg-slate-900/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-wider border-b-2 shrink-0 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-500 bg-white/40 dark:bg-[#0c101b]/40'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Form Content Wrapper */}
          <div className="p-6 md:p-8 space-y-6">
            {/* 1. Transportation Tab */}
            {activeTab === 'transport' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-200/10">Transportation Logs (Monthly Distance in km)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Car Distance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Car Distance</label>
                      <span>{inputs.transportation.carDist} km</span>
                    </div>
                    <input 
                      type="range" min="0" max="5000" step="50"
                      value={inputs.transportation.carDist}
                      onChange={(e) => handleNestedChange('transportation', 'carDist', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Car Fuel Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500">Car Fuel Type</label>
                    <select
                      value={inputs.transportation.carFuel}
                      onChange={(e) => handleNestedChange('transportation', 'carFuel', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/60 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="petrol">Petrol (0.18 kg CO₂/km)</option>
                      <option value="diesel">Diesel (0.17 kg CO₂/km)</option>
                      <option value="cng">CNG (0.12 kg CO₂/km)</option>
                      <option value="electric">Electric (0.05 kg CO₂/km)</option>
                    </select>
                  </div>

                  {/* Two Wheeler Distance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Motor Bike / Scooter Distance</label>
                      <span>{inputs.transportation.bikeDist} km</span>
                    </div>
                    <input 
                      type="range" min="0" max="3000" step="50"
                      value={inputs.transportation.bikeDist}
                      onChange={(e) => handleNestedChange('transportation', 'bikeDist', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Bus Distance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Bus Commuting Distance</label>
                      <span>{inputs.transportation.busDist} km</span>
                    </div>
                    <input 
                      type="range" min="0" max="2000" step="20"
                      value={inputs.transportation.busDist}
                      onChange={(e) => handleNestedChange('transportation', 'busDist', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Train Distance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Train/Metro Distance</label>
                      <span>{inputs.transportation.trainDist} km</span>
                    </div>
                    <input 
                      type="range" min="0" max="3000" step="50"
                      value={inputs.transportation.trainDist}
                      onChange={(e) => handleNestedChange('transportation', 'trainDist', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Flight Distance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Flights Traveled Distance</label>
                      <span>{inputs.transportation.flightDist} km</span>
                    </div>
                    <input 
                      type="range" min="0" max="10000" step="100"
                      value={inputs.transportation.flightDist}
                      onChange={(e) => handleNestedChange('transportation', 'flightDist', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Electricity Tab */}
            {activeTab === 'electricity' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-200/10">Electricity & Power Consumption (Monthly estimates)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Energy Units */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Monthly Grid Power Usage</label>
                      <span>{inputs.electricity.monthlyUnits} kWh (Units)</span>
                    </div>
                    <input 
                      type="range" min="0" max="1000" step="10"
                      value={inputs.electricity.monthlyUnits}
                      onChange={(e) => handleNestedChange('electricity', 'monthlyUnits', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* AC Daily Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Air Conditioning Usage</label>
                      <span>{inputs.electricity.acHours} hrs/day</span>
                    </div>
                    <input 
                      type="range" min="0" max="24" step="0.5"
                      value={inputs.electricity.acHours}
                      onChange={(e) => handleNestedChange('electricity', 'acHours', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Fan Count */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Active Ceiling Fans Count</label>
                      <span>{inputs.electricity.fanCount} Fans</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={inputs.electricity.fanCount}
                      onChange={(e) => handleNestedChange('electricity', 'fanCount', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Tube Light Count */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Lights & Bulb count</label>
                      <span>{inputs.electricity.lightCount} Bulbs</span>
                    </div>
                    <input 
                      type="range" min="0" max="20" step="1"
                      value={inputs.electricity.lightCount}
                      onChange={(e) => handleNestedChange('electricity', 'lightCount', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Food / Diet Tab */}
            {activeTab === 'food' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-200/10">Dietary Emissions Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Diet Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500">Core Diet Profile</label>
                    <select
                      value={inputs.food.dietType}
                      onChange={(e) => handleNestedChange('food', 'dietType', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/60 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="vegan">Vegan (No animal products - ~30kg/mo)</option>
                      <option value="vegetarian">Vegetarian (Dairy only - ~45kg/mo)</option>
                      <option value="non-veg">Moderate Meat Eater (Poultry, fish - ~90kg/mo)</option>
                      <option value="heavy-meat">Heavy Meat Eater (Red meat - ~135kg/mo)</option>
                    </select>
                  </div>

                  {/* Dairy Level */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500">Dairy & Milk Consumption</label>
                    <select
                      value={inputs.food.dairyLevel}
                      onChange={(e) => handleNestedChange('food', 'dairyLevel', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/60 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="low">Low (Plant milk, rare cheese)</option>
                      <option value="medium">Medium (Standard milk, daily butter)</option>
                      <option value="high">High (Cheese lover, multiple milk cups)</option>
                    </select>
                  </div>

                  {/* Fast Food Meals per Week */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Restaurant / Fast Food Frequency</label>
                      <span>{inputs.food.fastFoodFreq} meals/week</span>
                    </div>
                    <input 
                      type="range" min="0" max="15" step="1"
                      value={inputs.food.fastFoodFreq}
                      onChange={(e) => handleNestedChange('food', 'fastFoodFreq', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Digital & Devices Tab */}
            {activeTab === 'internet' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-200/10">Digital footprint (Daily Device Hours)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Screen Hours */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Mobile Device Usage</label>
                      <span>{inputs.internet.mobileHours} hrs/day</span>
                    </div>
                    <input 
                      type="range" min="0" max="16" step="0.5"
                      value={inputs.internet.mobileHours}
                      onChange={(e) => handleNestedChange('internet', 'mobileHours', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Laptop Hours */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Laptop / Desktop Usage</label>
                      <span>{inputs.internet.laptopHours} hrs/day</span>
                    </div>
                    <input 
                      type="range" min="0" max="16" step="0.5"
                      value={inputs.internet.laptopHours}
                      onChange={(e) => handleNestedChange('internet', 'laptopHours', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Streaming Hours */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>HD Streaming (Netflix, YouTube)</label>
                      <span>{inputs.internet.streamingHours} hrs/day</span>
                    </div>
                    <input 
                      type="range" min="0" max="12" step="0.5"
                      value={inputs.internet.streamingHours}
                      onChange={(e) => handleNestedChange('internet', 'streamingHours', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* PC/Console Gaming Hours */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>PC & Console Gaming</label>
                      <span>{inputs.internet.gamingHours} hrs/day</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="0.5"
                      value={inputs.internet.gamingHours}
                      onChange={(e) => handleNestedChange('internet', 'gamingHours', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Household Fuels Tab */}
            {activeTab === 'fuel' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-350 border-b pb-2 border-slate-200/10">Household Combustion Fuels (Monthly quantities)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LPG Cylinders */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>LPG Gas Cylinders Used</label>
                      <span>{inputs.fuel.lpgCylinders} Cylinders (14.2 kg standard)</span>
                    </div>
                    <input 
                      type="range" min="0" max="5" step="0.1"
                      value={inputs.fuel.lpgCylinders}
                      onChange={(e) => handleNestedChange('fuel', 'lpgCylinders', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Coal Weight */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Coal Burned (Heating/Cooking)</label>
                      <span>{inputs.fuel.coalWeight} kg</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" step="5"
                      value={inputs.fuel.coalWeight}
                      onChange={(e) => handleNestedChange('fuel', 'coalWeight', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>

                  {/* Wood Weight */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <label>Wood Fuel Consumed</label>
                      <span>{inputs.fuel.woodWeight} kg</span>
                    </div>
                    <input 
                      type="range" min="0" max="300" step="5"
                      value={inputs.fuel.woodWeight}
                      onChange={(e) => handleNestedChange('fuel', 'woodWeight', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-555"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Scientific Basis Section */}
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/10 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <span>🔬 Scientific Calculation Basis</span>
              </div>
              {activeTab === 'transport' && (
                <p className="leading-relaxed">
                  Transportation carbon indices are calculated using standard per-passenger-kilometer passenger transit guidelines (EPA & DEFRA). 
                  Car petrol is rated at <strong>0.18 kg CO₂/km</strong>, Diesel at <strong>0.17 kg CO₂/km</strong>, CNG at <strong>0.12 kg CO₂/km</strong>, and Electric cars at <strong>0.05 kg CO₂/km</strong> (representing indirect power grid source emissions). 
                  Flights are calculated based on medium-haul economy averages of <strong>0.15 kg CO₂/passenger-km</strong>.
                </p>
              )}
              {activeTab === 'electricity' && (
                <p className="leading-relaxed">
                  Electricity emissions are based on the national average grid carbon intensity coefficient of <strong>0.82 kg CO₂ per kWh</strong>. 
                  A typical 1.5-ton AC draws approximately 1.5 kWh/hr under standard compressor load, yielding <strong>1.2 kg CO₂/hr</strong>. 
                  CE certified ceiling fans are calculated at 60W (0.05 kg/hr) and efficient lights are calculated at an average 20W LED equivalence (0.015 kg/hr).
                </p>
              )}
              {activeTab === 'food' && (
                <p className="leading-relaxed">
                  Dietary factors represent lifecycle food production greenhouse gases (methane, transport, and deforestation). 
                  Vegan profiles account for ~30 kg CO₂/month baseline, Vegetarian profiles ~45 kg CO₂/month baseline, moderate Non-Veg profiles ~90 kg CO₂/month, and Heavy Meat (beef/lamb heavy) profiles reach ~135 kg CO₂/month. 
                  Commercial fast food meals carry an average preparation and supply-chain intensity of <strong>1.5 kg CO₂ per meal</strong>.
                </p>
              )}
              {activeTab === 'internet' && (
                <p className="leading-relaxed">
                  Digital emissions account for user device power, domestic network routing, and massive backend server/datacenter cooling. 
                  HD Video streaming averages <strong>0.18 kg CO₂/hr</strong> due to high bandwidth and transcode loads. 
                  High-end console or PC gaming draws ~350W (0.3 kg CO₂/hr). Laptops run around 60W (0.05 kg CO₂/hr), while mobile phones draw minimal network/battery power at <strong>0.015 kg CO₂/hr</strong>.
                </p>
              )}
              {activeTab === 'fuel' && (
                <p className="leading-relaxed">
                  Direct combustion fuels calculated using IPCC carbon coefficients for residential combustion. 
                  LPG gas cylinders release <strong>42.5 kg CO₂</strong> per standard 14.2 kg container. 
                  Coal combustion creates high direct emissions of <strong>2.42 kg CO₂ per kg</strong> of coal. 
                  Wood burning yields <strong>1.83 kg CO₂ per kg</strong> (net direct emissions, excluding forestry offset cycles).
                </p>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200/10">
              <button
                type="button"
                disabled={activeTab === 'transport'}
                onClick={() => {
                  const idx = tabs.findIndex(t => t.id === activeTab);
                  if (idx > 0) setActiveTab(tabs[idx - 1].id);
                }}
                className="px-4 py-2 text-xs font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 disabled:opacity-30 transition-colors"
              >
                Previous Section
              </button>

              {activeTab === 'fuel' ? (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-emerald-555 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-glow transition-all active:scale-97 cursor-pointer"
                  style={{ backgroundColor: '#10b981' }}
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <span>Save Record</span>
                      <Save className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors"
                >
                  Next Section
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Footprint Panel */}
        <div className="rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm p-6 space-y-6 lg:sticky lg:top-24">
          <div>
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Live Footprint analysis</h3>
            <p className="text-xs text-slate-400">Instantly calculated monthly footprint</p>
          </div>

          {/* Main big emission display */}
          <div className="flex flex-col items-center py-5 border-b border-slate-200/10">
            <h1 className="text-5xl font-black font-outfit text-slate-800 dark:text-white tracking-tight">
              {liveBreakdown.total}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              kg CO₂ / Month
            </p>
            
            {/* Target Status Badge */}
            <div className="mt-3">
              {liveBreakdown.total <= 167 ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  🌱 Paris Agreement Compliant (&lt;167 kg)
                </span>
              ) : liveBreakdown.total <= 400 ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-550 border border-amber-550/20 animate-pulse" style={{ color: '#d97706', borderColor: 'rgba(217,119,6,0.2)' }}>
                  ⚠️ Moderate Footprint (167 - 400 kg)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  🚨 High Climate Impact (&gt;400 kg)
                </span>
              )}
            </div>
          </div>

          {/* Micro-bar category breakdown */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Category Share</h4>
            
            {/* Transport Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Transportation</span>
                <span className="font-bold">{liveBreakdown.transportation} kg</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${Math.min(100, liveBreakdown.total > 0 ? (liveBreakdown.transportation / liveBreakdown.total) * 100 : 0)}%` }} />
              </div>
            </div>

            {/* Electricity Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Electricity</span>
                <span className="font-bold">{liveBreakdown.electricity} kg</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${Math.min(100, liveBreakdown.total > 0 ? (liveBreakdown.electricity / liveBreakdown.total) * 100 : 0)}%` }} />
              </div>
            </div>

            {/* Food Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Food Consumption</span>
                <span className="font-bold">{liveBreakdown.food} kg</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, liveBreakdown.total > 0 ? (liveBreakdown.food / liveBreakdown.total) * 100 : 0)}%` }} />
              </div>
            </div>

            {/* Internet Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Internet & Devices</span>
                <span className="font-bold">{liveBreakdown.internet} kg</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${Math.min(100, liveBreakdown.total > 0 ? (liveBreakdown.internet / liveBreakdown.total) * 100 : 0)}%` }} />
              </div>
            </div>

            {/* Fuel Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Household Fuels</span>
                <span className="font-bold">{liveBreakdown.fuel} kg</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${Math.min(100, liveBreakdown.total > 0 ? (liveBreakdown.fuel / liveBreakdown.total) * 100 : 0)}%` }} />
              </div>
            </div>
          </div>

          {/* Real-world Equivalents Card */}
          <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Environmental Equivalents</h4>
            
            <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-500 dark:text-slate-350">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">🌲</span>
                <span>Requires <strong>{Math.max(1, Math.round(liveBreakdown.total * 12 / 22))}</strong> mature trees growing for a year to absorb this monthly footprint.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">🚗</span>
                <span>Equivalent to driving <strong>{Math.round(liveBreakdown.total / 0.18)}</strong> km in an average gasoline car.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">⚡</span>
                <span>Equivalent to running a standard LED bulb for <strong>{Math.round(liveBreakdown.total / 0.015)}</strong> hours.</span>
              </div>
            </div>
          </div>

          {/* Quick Tip Alert */}
          <div className="p-3 text-xs bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/10 flex gap-2">
            <span className="shrink-0">🌱</span>
            <span>Tip: Try turning down the AC usage or choosing more vegan meals to see your live footprint decrease instantly!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
