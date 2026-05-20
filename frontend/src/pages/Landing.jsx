import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Shield, Award, LineChart, Globe, Zap, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Background visual decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 dark:bg-teal-555/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header / Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/60 dark:bg-[#0b0f19]/60 border-b border-slate-200/20 dark:border-slate-800/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-glow">
              <Leaf className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-lg tracking-tight font-outfit bg-gradient-to-r from-emerald-555 to-teal-500 bg-clip-text text-transparent">
              EcoTrace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold hover:text-emerald-500 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-glow transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-8 animate-fade-in">
          <Award className="h-3.5 w-3.5" />
          <span>Award-Winning Environmental Tracker</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-outfit tracking-tight leading-tight max-w-4xl mx-auto bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent">
          Measure, Visualize, and <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Neutralize</span> Your Carbon Impact
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Track emissions across travel, utilities, dietary habits, and daily device usage. Leverage smart AI guidance, earn sustainable badges, and build positive green habits today.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-xl bg-emerald-555 hover:bg-emerald-600 text-white font-bold shadow-glow flex items-center gap-2 group transition-all duration-300 hover:scale-[1.03]"
            style={{ backgroundColor: '#10b981' }}
          >
            Start Footprint Calculation
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all"
          >
            Explore Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <section className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          <div className="p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 glass-panel shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
              Granular Calculations
            </h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Computes daily CO₂ emissions using standard EPA ratios. Inputs include car mileage, appliance logs, flight hours, diet routines, and LPG counts.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 glass-panel shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6">
              <LineChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
              Interactive Analytics
            </h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Explore your emission breakdowns with responsive charts. Inspect your monthly averages and compare your values directly with international averages.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 glass-panel shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-555/20 border border-emerald-500/20 flex items-center justify-center text-emerald-550 dark:text-emerald-400 mb-6" style={{ color: '#10b981' }}>
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
              Smart AI Recommendations
            </h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Obtain customized reductions checklist. Chat directly with EcoBot to learn about sustainability actions and qualify for high scores and community ranks.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/20 dark:border-slate-800/20 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-slate-600 dark:text-slate-400 font-outfit">EcoTrace Tracker</span>
          </div>
          <p>© {new Date().getFullYear()} EcoTrace Project. Designed for College Major Showcase & Placements.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
