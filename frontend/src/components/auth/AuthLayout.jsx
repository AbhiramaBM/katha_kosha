import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function AuthLayout({ children, title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Left Branding Side (Desktop 45%) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 bg-slate-900 text-white overflow-hidden selection:bg-brand-500 selection:text-white">
        {/* Abstract Background Visuals */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-600/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">NexusAuth</span>
            <span className="block text-[10px] font-semibold text-brand-400 uppercase tracking-widest">
              Identity Platform
            </span>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 my-auto py-12 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen SaaS Authentication</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Security and elegance, built for high-growth platforms.
          </h2>

          <p className="text-slate-400 text-sm xl:text-base leading-relaxed mb-8">
            Complete authentication lifecycle engineered with JWT tokens, session refresh, role controls, and modern user experiences.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <Lock className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="font-medium text-slate-300">Secure JWT Flow</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-slate-300">Zero-Trust Tokens</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Testimonial / Footer */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <span>&copy; {new Date().getFullYear()} NexusAuth Inc.</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Right Form Side (Mobile 100%, Desktop 55%) */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-14">
        {/* Top Bar with Mobile Branding & Theme Switcher */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">NexusAuth</span>
          </div>

          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle dark/light mode"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            {title && (
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Inner Form Content */}
            <div className="bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Bottom Legal Links */}
        <div className="w-full max-w-md mx-auto mt-8 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-4">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy Policy</a>
          <span>&bull;</span>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">Terms of Service</a>
          <span>&bull;</span>
          <a href="#help" onClick={(e) => e.preventDefault()} className="hover:underline">Support</a>
        </div>
      </div>
    </div>
  );
}
