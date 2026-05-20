import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import api from '../utils/api';
import { 
  Zap, 
  Car, 
  Utensils, 
  Globe, 
  CheckCircle2, 
  Circle,
  HelpCircle,
  Award
} from 'lucide-react';

const Recommendations = () => {
  const { user, reloadProfile } = useAuth();
  
  // Local state for checking habits
  const [completedHabits, setCompletedHabits] = useState([]);

  useEffect(() => {
    if (user && user.completedHabits) {
      setCompletedHabits(user.completedHabits);
    }
  }, [user]);

  const habits = [
    {
      id: 'h1',
      title: 'Commute via Public Transport',
      category: 'transport',
      impact: 'High',
      co2Reduction: 75,
      points: 15,
      description: 'Opt for buses, trains or metro instead of personal cars to reduce transit CO2 by 75% per trip.',
      icon: <Car className="h-5 w-5 text-sky-500" />
    },
    {
      id: 'h2',
      title: 'Maintain AC at 24°C',
      category: 'electricity',
      impact: 'Medium',
      co2Reduction: 30,
      points: 10,
      description: 'Avoid running ACs at low temperatures (like 18°C). Every degree higher cuts compressor load by 6%.',
      icon: <Zap className="h-5 w-5 text-amber-500" />
    },
    {
      id: 'h3',
      title: 'Practice Meatless Mondays',
      category: 'food',
      impact: 'High',
      co2Reduction: 50,
      points: 15,
      description: 'Swapping meat for plant proteins once a week drastically minimizes methane and agricultural CO2.',
      icon: <Utensils className="h-5 w-5 text-emerald-500" />
    },
    {
      id: 'h4',
      title: 'Switch Off Standby Appliances',
      category: 'electricity',
      impact: 'Low',
      co2Reduction: 12,
      points: 5,
      description: 'Unplug phone chargers, TVs, and microwave displays to prevent phantom electricity draw.',
      icon: <Zap className="h-5 w-5 text-amber-500" />
    },
    {
      id: 'h5',
      title: 'Lower Video Streaming Resolution',
      category: 'digital',
      impact: 'Low',
      co2Reduction: 8,
      points: 5,
      description: 'Stream YouTube or Netflix in SD (Standard Definition) to cut backend datacenter power usage by 80%.',
      icon: <Globe className="h-5 w-5 text-purple-500" />
    },
    {
      id: 'h6',
      title: 'Utilize LED Lightbulbs',
      category: 'electricity',
      impact: 'Medium',
      co2Reduction: 25,
      points: 10,
      description: 'Replace standard lightbulbs with LEDs which produce equivalent light with 80% less energy.',
      icon: <Zap className="h-5 w-5 text-amber-500" />
    }
  ];

  const [saving, setSaving] = useState(false);

  const handleToggleHabit = (id) => {
    if (completedHabits.includes(id)) {
      setCompletedHabits(prev => prev.filter(hid => hid !== id));
      showToast('Habit removed.', 'info');
    } else {
      setCompletedHabits(prev => [...prev, id]);
      showToast('Habit adopted! Great step!', 'success');
    }
  };

  const handleApplyHabits = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/habits', { habits: completedHabits });
      if (res.data.success) {
        showToast('Habits successfully saved to your profile! Environmental score recalculated.', 'success');
        await reloadProfile();
      }
    } catch (err) {
      console.error('Error applying habits:', err);
      showToast(err.response?.data?.message || 'Failed to apply habits to profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculate stats based on checked items
  const totalPointsEarned = habits
    .filter(h => completedHabits.includes(h.id))
    .reduce((acc, h) => acc + h.points, 0);

  const potentialCO2Saved = habits
    .filter(h => completedHabits.includes(h.id))
    .reduce((acc, h) => acc + h.co2Reduction, 0);

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'High': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Low':
      default: return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">Smart Eco Recommendations</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Check off sustainable habits you practice to see potential CO₂ savings and build your green profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Habit Checklist (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          {habits.map((habit) => {
            const isCompleted = completedHabits.includes(habit.id);
            return (
              <div 
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 ${
                  isCompleted 
                    ? 'glass-panel border-emerald-500/30 shadow-md ring-1 ring-emerald-500/20' 
                    : 'glass-panel hover:border-slate-350 dark:hover:border-slate-700'
                }`}
              >
                {/* Checkbox Icon */}
                <div className="shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-555 fill-emerald-555/10" style={{ color: '#10b981' }} />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-300 dark:text-slate-700 hover:text-slate-400" />
                  )}
                </div>

                {/* Habit Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-bold font-outfit text-sm sm:text-base ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {habit.title}
                    </h3>
                    {/* Category icon */}
                    <div className="p-1 rounded bg-slate-100 dark:bg-slate-800/80">
                      {habit.icon}
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-normal">
                    {habit.description}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-[10px] sm:text-xs">
                    <span className={`px-2 py-0.5 rounded-full border font-bold ${getImpactBadge(habit.impact)}`}>
                      Impact: {habit.impact}
                    </span>
                    <span className="text-slate-400 font-semibold">
                      CO₂ Saved: -{habit.co2Reduction} kg
                    </span>
                    <span className="text-slate-400 font-semibold">
                      Points: +{habit.points}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Habit Summary Scorecard */}
        <div className="rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm p-6 space-y-6 lg:sticky lg:top-24">
          <div>
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Environmental Savings Summary</h3>
            <p className="text-xs text-slate-400">Potential monthly impact reductions</p>
          </div>

          {/* Points Progress */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-center">
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Carbon Reduction</p>
              <h2 className="text-3xl font-black text-emerald-500 font-outfit mt-1">
                -{potentialCO2Saved} kg <span className="text-xs text-slate-400 font-normal">CO₂/Mo</span>
              </h2>
            </div>

            <div className="p-4 rounded-xl border border-sky-500/10 bg-sky-500/5 text-center">
              <p className="text-xs text-slate-400 font-semibold uppercase">Green Habits Score</p>
              <h2 className="text-3xl font-black text-sky-500 font-outfit mt-1">
                +{totalPointsEarned} <span className="text-xs text-slate-400 font-normal">Points</span>
              </h2>
            </div>
          </div>

          {/* Gamified feedback */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-2.5 text-xs text-slate-500 leading-relaxed">
              <Award className="h-4.5 w-4.5 shrink-0 text-amber-500" />
              <span>Adopting 3 or more high impact habits helps qualify for the <strong>Climate Guardian</strong> badge!</span>
            </div>
            
            {completedHabits.length > 0 && (
              <button
                onClick={handleApplyHabits}
                disabled={saving}
                className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold text-center shadow-glow transition-all active:scale-97 cursor-pointer"
              >
                {saving ? 'Applying Impact...' : 'Apply Habits Impact to Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
