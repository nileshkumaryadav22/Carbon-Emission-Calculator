import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { Leaf, User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, token } = useAuth();
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (username.length < 3) {
      showToast('Username must be at least 3 characters', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setFormLoading(true);
    const result = await register(username, email, password);
    setFormLoading(false);

    if (result.success) {
      showToast('Welcome to EcoTrace, tracking initialized!', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative gradient blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal-500/10 dark:bg-teal-555/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-glow mb-3">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white">Create Account</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">
            Join the community and track your carbon footprint
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 glass-panel shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="green_warrior"
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 bg-white/50 dark:bg-slate-900/55 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 bg-white/50 dark:bg-slate-900/55 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 chars)"
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 bg-white/50 dark:bg-slate-900/55 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-555 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-98 cursor-pointer"
              style={{ backgroundColor: '#10b981' }}
            >
              {formLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Prompt to login */}
          <div className="mt-6 pt-6 border-t border-slate-200/20 dark:border-slate-800/20 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-bold text-emerald-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-0.5"
              >
                Sign In <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
