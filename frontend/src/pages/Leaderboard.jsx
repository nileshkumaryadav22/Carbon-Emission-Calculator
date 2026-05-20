import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { Trophy, Award, Search, Sparkles } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/records/leaderboard');
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        showToast('Error loading leaderboard.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Assembling green ranks...</p>
        </div>
      </div>
    );
  }

  // Filter leaderboard based on search query
  const filteredUsers = leaderboard.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs shadow-md">🥇</span>;
      case 2:
        return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-350 dark:bg-slate-500 text-white font-bold text-xs shadow-md">🥈</span>;
      case 3:
        return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-xs shadow-md">🥉</span>;
      default:
        return <span className="text-slate-400 dark:text-slate-500 font-semibold">{rank}</span>;
    }
  };

  const getBadgeColor = (badge) => {
    if (badge === 'Carbon Zero Hero') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
    if (badge === 'Eco Warrior') return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25';
    if (badge === 'Green Commuter') return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/40 dark:border-slate-800/40';
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">Community Leaderboard</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Compare your environmental score against other green developers. Keep footprints low to top the ranks!
            </p>
          </div>
        </div>
      </div>

      {/* Ranks Cards & List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Leaderboard Table (Span 2) */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm p-6 space-y-4">
          {/* Search box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Ranks Log */}
          <div className="overflow-hidden rounded-xl border border-slate-200/10 bg-slate-50/20 dark:bg-slate-900/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200/20 dark:border-slate-800/20 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Rank</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Environmental Score</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Top Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/15 dark:divide-slate-800/15">
                {filteredUsers.map((item, index) => {
                  const isCurrentUser = item._id === user?._id;
                  const rank = index + 1;
                  return (
                    <tr 
                      key={item._id}
                      className={`hover:bg-slate-100/20 dark:hover:bg-slate-800/10 transition-colors ${
                        isCurrentUser ? 'bg-emerald-500/5 font-semibold text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    >
                      <td className="px-5 py-4">{getRankBadge(rank)}</td>
                      <td className="px-5 py-4 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
                          {item.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate">{item.username}</span>
                        {isCurrentUser && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold tracking-wide uppercase shrink-0">YOU</span>}
                      </td>
                      <td className="px-5 py-4 font-bold text-sm">
                        {item.environmentalScore} / 100
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="flex gap-1.5 flex-wrap">
                          {item.badges.slice(-2).map((badge, idx) => (
                            <span 
                              key={idx} 
                              className={`px-2 py-0.5 rounded-full border text-[9px] font-medium tracking-wide ${getBadgeColor(badge)}`}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400">
                      No rank entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Badges Guide Scorecard */}
        <div className="rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Badges Guide</h3>
            <p className="text-xs text-slate-400">Environmental Score thresholds</p>
          </div>

          <div className="space-y-4">
            {/* Carbon Zero Hero */}
            <div className="flex gap-3 p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
              <Award className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Carbon Zero Hero</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Achieved with an Environmental score of <strong>85+</strong>. (Extremely low footprint).
                </p>
              </div>
            </div>

            {/* Eco Warrior */}
            <div className="flex gap-3 p-3 rounded-xl border border-teal-500/10 bg-teal-500/5">
              <Award className="h-6 w-6 text-teal-555 shrink-0 mt-0.5" style={{ color: '#14b8a6' }} />
              <div>
                <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400">Eco Warrior</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Achieved with an Environmental score of <strong>70+</strong>. (Moderate-low emissions).
                </p>
              </div>
            </div>

            {/* Green Commuter */}
            <div className="flex gap-3 p-3 rounded-xl border border-sky-500/10 bg-sky-500/5">
              <Award className="h-6 w-6 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400">Green Commuter</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Achieved with an Environmental score of <strong>50+</strong>. (Average impact).
                </p>
              </div>
            </div>

            {/* Climate Guardian */}
            <div className="flex gap-3 p-3 rounded-xl border border-purple-500/10 bg-purple-500/5">
              <Sparkles className="h-6 w-6 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400">Climate Guardian</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Unlocked by logging <strong>10 or more</strong> calculations in history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
