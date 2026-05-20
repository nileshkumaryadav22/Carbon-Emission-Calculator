import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { User, Mail, Lock, Award, Shield, Save, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // Profile form state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email) {
      showToast('Username and Email are required.', 'warning');
      return;
    }

    if (password && password.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setFormLoading(true);
    const result = await updateProfile(username, email, password);
    setFormLoading(false);

    if (result.success) {
      showToast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
    } else {
      showToast(result.message || 'Error updating profile.', 'error');
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Carbon Zero Hero': return '🏆';
      case 'Eco Warrior': return '🛡️';
      case 'Green Commuter': return '🚲';
      case 'Climate Guardian': return '🌍';
      case 'Low Carbon Champion': return '⚡';
      case 'Eco Novice':
      default: return '🌱';
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm">
        <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">Account Settings & Achievements</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Modify your username and credentials, and inspect unlocked green badges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Settings Form (Span 2) */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm p-6 sm:p-8">
          <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-250 border-b border-slate-200/10 pb-3 mb-6">Credentials Configuration</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-105 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-105 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* New Password inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-200/10">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-11 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-105 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-105 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-3 rounded-xl bg-emerald-555 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all cursor-pointer"
              style={{ backgroundColor: '#10b981' }}
            >
              {formLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Unlocked Badges Panel */}
        <div className="rounded-2xl border border-slate-200/40 dark:border-[#1e293b]/40 glass-panel shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-md font-bold font-outfit text-slate-700 dark:text-slate-200">Unlocked Badges</h3>
            <p className="text-xs text-slate-400">Earn achievements for tracking green footprints</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {user?.badges.map((badge, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/20 dark:border-slate-800/40 bg-slate-100/40 dark:bg-[#0c101b]/40 shadow-sm"
              >
                <span className="text-2xl shrink-0">{getBadgeIcon(badge)}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-750 dark:text-slate-200 capitalize">{badge}</h4>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Unlocked Achievement Badge</p>
                </div>
              </div>
            ))}

            {(!user?.badges || user.badges.length === 0) && (
              <div className="text-center p-6 text-slate-400 text-xs">
                No badges unlocked yet. Run carbon logs to begin!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
