import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Calculator, 
  Leaf, 
  Trophy, 
  History, 
  User, 
  Shield, 
  LogOut, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user, isAdmin } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Calculator', path: '/calculator', icon: <Calculator className="h-5 w-5" /> },
    { name: 'Recommendations', path: '/recommendations', icon: <Leaf className="h-5 w-5" /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy className="h-5 w-5" /> },
    { name: 'History', path: '/history', icon: <History className="h-5 w-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
  ];

  if (isAdmin) {
    navItems.push({ 
      name: 'Admin Panel', 
      path: '/admin', 
      icon: <Shield className="h-5 w-5" /> 
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300 lg:translate-x-0 glass-panel ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-slate-200/50 dark:border-slate-800/50`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/30 dark:border-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-glow">
              <Leaf className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-outfit tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                EcoTrace
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">
                Calculator
              </p>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* User Mini Profile */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-200/20 dark:border-slate-800/20">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
            {user?.username?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">
              {user?.username}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">
              {user?.role === 'admin' ? '🌍 Platform Admin' : '🌱 Green Member'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-glow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar Controls */}
        <div className="p-4 space-y-2 border-t border-slate-200/30 dark:border-slate-800/30">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-emerald-500" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`h-5 w-9 rounded-full p-0.5 transition-colors duration-200 ${darkMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-xl text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
