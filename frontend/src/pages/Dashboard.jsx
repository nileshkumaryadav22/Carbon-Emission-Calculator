import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  Zap, 
  Car, 
  Utensils, 
  Globe, 
  Flame, 
  TrendingDown, 
  Activity, 
  Award,
  Calendar,
  AlertTriangle,
  Sparkles
} from 'lucide-react';


const Dashboard = () => {
  const { user, reloadProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categoryAverages: { transportation: 0, electricity: 0, food: 0, internet: 0, fuel: 0 },
    monthlyTrends: [],
    comparison: { userAverage: 0, userCurrentMonth: 0, globalAverage: 450 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/records/stats');
        if (res.data.success) {
          setStats({
            categoryAverages: res.data.categoryAverages,
            monthlyTrends: res.data.monthlyTrends,
            comparison: res.data.comparison
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        showToast('Error loading footprint statistics.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    reloadProfile(); // Keep profile environmental score updated
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aggregating carbon data...</p>
        </div>
      </div>
    );
  }

  // Format data for Pie Chart
  const pieData = [
    { name: 'Transportation', value: stats.categoryAverages.transportation, color: '#0284c7', icon: <Car className="h-5 w-5" /> },
    { name: 'Electricity', value: stats.categoryAverages.electricity, color: '#f59e0b', icon: <Zap className="h-5 w-5" /> },
    { name: 'Food Consumption', value: stats.categoryAverages.food, color: '#10b981', icon: <Utensils className="h-5 w-5" /> },
    { name: 'Internet & Devices', value: stats.categoryAverages.internet, color: '#8b5cf6', icon: <Globe className="h-5 w-5" /> },
    { name: 'Fuel Combustion', value: stats.categoryAverages.fuel, color: '#ef4444', icon: <Flame className="h-5 w-5" /> }
  ].filter(item => item.value > 0); // Only display configured values

  // Comparison bar data
  const comparisonData = [
    {
      name: 'Your Current Month',
      CO2: stats.comparison.userCurrentMonth,
      fill: '#10b981'
    },
    {
      name: 'Your Lifetime Avg',
      CO2: stats.comparison.userAverage,
      fill: '#3b82f6'
    },
    {
      name: 'Global Average',
      CO2: stats.comparison.globalAverage,
      fill: '#64748b'
    }
  ];

  // Colors for Pie Chart
  const COLORS = pieData.map(d => d.color);

  // Environmental Rating
  const getScoreRating = (score) => {
    if (score >= 85) return { text: 'Excellent', color: 'text-emerald-500 dark:text-emerald-400', desc: 'Outstanding job! You are in the top tier of green consumers.' };
    if (score >= 70) return { text: 'Good', color: 'text-teal-500 dark:text-teal-400', desc: 'Great job! Keep refining your habits to achieve Carbon Zero.' };
    if (score >= 50) return { text: 'Average', color: 'text-amber-500 dark:text-amber-400', desc: 'Moderate emissions. Check recommendations to reduce impact.' };
    return { text: 'Critical', color: 'text-rose-500 dark:text-rose-400', desc: 'High carbon footprint! Immediate adjustments recommended.' };
  };

  const rating = getScoreRating(user?.environmentalScore || 100);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm relative overflow-hidden">
        <div className="space-y-1 z-10">
          <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">
            Hello, {user?.username}! 🌱
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Here is your carbon footprints and environmental score report.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-555/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold z-10" style={{ borderColor: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Footprint Card */}
        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Month Footprint</p>
            <h3 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white">
              {stats.comparison.userCurrentMonth} <span className="text-xs font-semibold text-slate-400">kg CO₂</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-emerald-500" />
              <span>Target: &lt; 300 kg CO₂</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Environmental Score Card */}
        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Environmental Score</p>
            <h3 className={`text-3xl font-extrabold font-outfit ${rating.color}`}>
              {user?.environmentalScore || 100} <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </h3>
            <p className="text-xs font-semibold uppercase text-slate-500">{rating.text} Rating</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-555" style={{ color: '#10b981' }}>
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Badge Unlocked Card */}
        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Badge</p>
            <h3 className="text-xl font-extrabold font-outfit text-slate-800 dark:text-white capitalize">
              {user?.badges[user.badges.length - 1] || 'Eco Novice'}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full w-max border border-emerald-550/20">
              {user?.badges.length} Badges Earned
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Comparison Alert Indicator */}
        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Footprint vs. Global</p>
            <h3 className="text-2xl font-extrabold font-outfit text-slate-800 dark:text-white">
              {stats.comparison.userCurrentMonth > stats.comparison.globalAverage ? (
                <span className="text-rose-500">+{Math.round((stats.comparison.userCurrentMonth / stats.comparison.globalAverage - 1) * 100)}% High</span>
              ) : (
                <span className="text-emerald-500">-{Math.round((1 - stats.comparison.userCurrentMonth / stats.comparison.globalAverage) * 100)}% Lower</span>
              )}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Compared to global avg (450 kg)</p>
          </div>
          <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${stats.comparison.userCurrentMonth > stats.comparison.globalAverage ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
            {stats.comparison.userCurrentMonth > stats.comparison.globalAverage ? <AlertTriangle className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col h-96">
          <div className="mb-4">
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Emission Trend (Past 6 Months)</h3>
            <p className="text-xs text-slate-400">Monthly average footprint tracking in kg CO₂</p>
          </div>
          
          <div className="flex-1 w-full min-h-0 min-w-0 text-xs" style={{ minWidth: 0 }}>
            {stats.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      borderColor: '#10b981', 
                      borderRadius: '12px',
                      color: '#fff' 
                    }}
                  />
                  <ReferenceLine 
                    y={167} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: 'Paris Limit (167 kg)', 
                      position: 'insideTopLeft', 
                      fill: '#ef4444', 
                      fontSize: 9,
                      fontWeight: 'bold'
                    }} 
                  />
                  <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Log your first calculations to display trend analytics.
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart of Categories */}
        <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col h-96">
          <div className="mb-4">
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Category Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of emissions in average calculations</p>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center relative min-h-0">
            {pieData.length > 0 ? (
              <>
                <div className="w-full h-40 min-w-0" style={{ minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-2.5 w-full mt-4 text-[11px]">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 font-medium truncate text-slate-600 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                      <span className="font-bold ml-auto shrink-0">{Math.round(item.value)}kg</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="h-10 w-10 text-slate-300 dark:text-slate-750">
                  <TrendingDown className="h-full w-full" />
                </div>
                <span>No emission breakdown data.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparisons and Tips Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Footprint Comparison */}
        <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col h-80">
          <div className="mb-4">
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Emissions Comparison</h3>
            <p className="text-xs text-slate-400">Comparison with average footprints (kg CO₂)</p>
          </div>
          
          <div className="flex-1 w-full min-h-0 min-w-0 text-xs" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={95} style={{ fontSize: '10px' }} />
                <Tooltip />
                <ReferenceLine 
                   x={167} 
                   stroke="#ef4444" 
                   strokeDasharray="4 4" 
                   strokeWidth={1.5}
                   label={{ 
                     value: 'Paris Limit (167 kg)', 
                     position: 'top', 
                     fill: '#ef4444', 
                     fontSize: 8,
                     fontWeight: 'bold'
                   }} 
                />
                <Bar dataKey="CO2" radius={[0, 8, 8, 0]} barSize={16}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Score Meter */}
        <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col justify-between h-80">
          <div>
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Environmental Appraisal</h3>
            <p className="text-xs text-slate-400">Analysis based on your tracking scores</p>
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Outer Score Circle */}
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="46" strokeWidth="8" stroke="rgba(16,185,129,0.1)" fill="transparent" />
                <circle cx="56" cy="56" r="46" strokeWidth="8" stroke="#10b981" fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - (user?.environmentalScore || 100) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-outfit text-slate-800 dark:text-white">
                  {user?.environmentalScore || 100}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Score
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold mt-4 text-center text-slate-700 dark:text-slate-350">
              {rating.desc}
            </p>
          </div>
        </div>

        {/* AI Recommendations Highlight */}
        <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col justify-between h-80">
          <div>
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Quick recommendations</h3>
            <p className="text-xs text-slate-400">Direct habits to boost your environmental rating</p>
          </div>

          <div className="space-y-3.5 my-4">
            <div className="flex gap-3 text-xs bg-slate-100/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/10">
              <span className="h-5 w-5 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-lg flex items-center justify-center shrink-0">🚗</span>
              <p className="text-slate-600 dark:text-slate-300 leading-normal">
                Using local public trains instead of single occupant vehicles decreases commuting footprint by ~70%.
              </p>
            </div>
            <div className="flex gap-3 text-xs bg-slate-100/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/10">
              <span className="h-5 w-5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg flex items-center justify-center shrink-0">💡</span>
              <p className="text-slate-600 dark:text-slate-300 leading-normal">
                Maintaining standard air conditioning temperatures at 24°C controls monthly grid units usage.
              </p>
            </div>
          </div>

          <Link
            to="/recommendations"
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-slate-600 dark:text-slate-200 text-xs font-bold text-center border border-slate-200/40 dark:border-slate-700/50 transition-all cursor-pointer"
          >
            Review Recommendations Checklist
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
