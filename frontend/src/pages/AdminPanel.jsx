import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Trash2, 
  BarChart2, 
  Globe, 
  ShieldCheck, 
  Download,
  AlertOctagon
} from 'lucide-react';

const AdminPanel = () => {
  const { user: currentAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    standardUserCount: 0,
    adminCount: 0,
    totalRecords: 0,
    totalPlatformCO2: 0,
    averageFootprint: 0,
    mostPollutingCategory: 'None',
    categoryDistribution: [],
    scoreBrackets: { excellent: 0, good: 0, average: 0, poor: 0 }
  });

  const [activeTab, setActiveTab] = useState('users');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      const usersRes = await api.get('/admin/users');
      
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error fetching admin details:', err);
      showToast('Error loading administrator assets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id, username) => {
    if (id.toString() === currentAdmin._id.toString()) {
      showToast('You cannot delete your own admin account.', 'warning');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${username}" and all their carbon logs? This cannot be undone.`)) return;

    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        showToast(`User "${username}" deleted successfully!`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast(err.response?.data?.message || 'Error deleting user.', 'error');
    }
  };

  // Export JSON Report of platform
  const handleExportPlatformReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ stats, users }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "platform_emission_report.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Platform report exported successfully!', 'success');
  };

  // Recharts colors
  const COLORS = ['#0284c7', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

  const scoreChartData = [
    { name: 'Excellent (85+)', count: stats.scoreBrackets.excellent, fill: '#10b981' },
    { name: 'Good (70-84)', count: stats.scoreBrackets.good, fill: '#14b8a6' },
    { name: 'Average (50-69)', count: stats.scoreBrackets.average, fill: '#f59e0b' },
    { name: 'Poor (<50)', count: stats.scoreBrackets.poor, fill: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading administrator console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-555/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">Admin Controller Panel</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
              Monitor user accounts, platform statistics, emission aggregates, and export platform metrics.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleExportPlatformReport}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow cursor-pointer"
        >
          <Download className="h-4.5 w-4.5" />
          Export Platform JSON
        </button>
      </div>

      {/* Aggregate Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Registered Users</p>
            <h3 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white mt-1">{stats.totalUsers}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/25 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Calculations Run</p>
            <h3 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white mt-1">{stats.totalRecords}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center justify-center">
            <BarChart2 className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Platform CO₂</p>
            <h3 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white mt-1">{stats.totalPlatformCO2} <span className="text-xs font-normal text-slate-400">kg</span></h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-555/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center">
            <Globe className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Most Polluting Category</p>
            <h3 className="text-xl font-extrabold font-outfit text-rose-500 mt-1.5 truncate max-w-[150px]">{stats.mostPollutingCategory}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 flex items-center justify-center">
            <AlertOctagon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200/10 gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 cursor-pointer ${
            activeTab === 'users' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          User Account Logs ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 cursor-pointer ${
            activeTab === 'analytics' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Platform Analytics
        </button>
      </div>

      {/* 1. Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm p-6 space-y-4 animate-fade-in">
          <div className="overflow-hidden rounded-xl border border-slate-200/10 bg-slate-50/20 dark:bg-slate-900/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200/20 dark:border-slate-800/20 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Username</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Eco Score</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/15 dark:divide-slate-800/15">
                {users.map((item) => {
                  const isCurrentAdmin = item._id === currentAdmin._id;
                  const dateStr = new Date(item.createdAt).toLocaleDateString();
                  return (
                    <tr key={item._id} className="hover:bg-slate-100/20 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold font-outfit text-slate-500">
                          {item.username.slice(0,2).toUpperCase()}
                        </div>
                        <span>{item.username}</span>
                        {isCurrentAdmin && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold tracking-wide uppercase">YOU</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{item.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.role === 'admin' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-550/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-200">{item.environmentalScore} / 100</td>
                      <td className="px-5 py-4 text-slate-450">{dateStr}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(item._id, item.username)}
                          disabled={isCurrentAdmin}
                          title={isCurrentAdmin ? 'Cannot delete yourself' : 'Delete user and records'}
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-550 disabled:opacity-20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Category Distribution across all users */}
          <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col h-96">
            <div className="mb-4">
              <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Emissions Category Distribution</h3>
              <p className="text-xs text-slate-400">Total platforms carbon breakdown in percent</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center relative min-h-0">
              {stats.categoryDistribution.length > 0 ? (
                <>
                  <div className="w-full h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stats.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend Grid */}
                  <div className="grid grid-cols-3 gap-2 w-full mt-4 text-[10px]">
                    {stats.categoryDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1 font-semibold truncate text-slate-600 dark:text-slate-350">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="truncate">{item.name}</span>
                        <span className="font-bold text-slate-400 ml-auto shrink-0">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-xs">No records log platform values.</div>
              )}
            </div>
          </div>

          {/* User Score Appraisal bracket distribution */}
          <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col h-96">
            <div className="mb-4">
              <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Environmental Score Brackets</h3>
              <p className="text-xs text-slate-400">Number of users in each ranking tier</p>
            </div>

            <div className="flex-1 w-full min-h-0 text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={28}>
                    {scoreChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
