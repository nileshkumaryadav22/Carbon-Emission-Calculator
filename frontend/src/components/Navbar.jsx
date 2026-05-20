import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, ShieldAlert, Award, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Find human readable title from route path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/calculator') return 'Carbon Calculator';
    if (path === '/recommendations') return 'Green Habits';
    if (path === '/leaderboard') return 'Community Leaderboard';
    if (path === '/history') return 'Emission History';
    if (path === '/profile') return 'My Profile';
    if (path === '/admin') return 'Admin Dashboard';
    return 'EcoTrace';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30';
    if (score >= 50) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b backdrop-blur-md bg-white/70 dark:bg-[#0b0f19]/70 border-slate-200/40 dark:border-slate-800/40">
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Dynamic Title */}
        <h2 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100 md:text-xl">
          {getPageTitle()}
        </h2>
      </div>

      {/* User Information Summary */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            {/* Score Badge Indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getScoreBadgeColor(user.environmentalScore)}`}>
              <Award className="h-3.5 w-3.5" />
              <span>Eco Score: {user.environmentalScore}/100</span>
            </div>

            {/* Profile Avatar & Details */}
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200/40 dark:border-slate-800/40">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {user.username}
                </p>
                <p className="text-[10px] text-emerald-555 font-medium text-emerald-500">
                  {user.badges[user.badges.length - 1] || 'Eco Novice'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center shadow-sm">
                {user.username?.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
