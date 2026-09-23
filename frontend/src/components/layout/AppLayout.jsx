import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  PenTool, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  PlusCircle, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export function AppLayout({ children }) {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      to: '/dashboard',
      labelKn: 'ಮುಖಪುಟ & ಅಂಕಿಅಂಶ',
      labelEn: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      to: '/stories',
      labelKn: 'ಕಥಾ ಭಂಡಾರ',
      labelEn: 'Stories Archive',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      to: '/stories/new',
      labelKn: 'ಹೊಸ ಕಥೆ ರಚನೆ',
      labelEn: 'New Story',
      icon: <PenTool className="w-4 h-4" />
    },
    {
      to: '/authors',
      labelKn: 'ಸಾಹಿತಿಗಳ ಪರಿಚಯ',
      labelEn: 'Authors Directory',
      icon: <Users className="w-4 h-4" />
    }
  ];

  // Admin-only nav item
  if (isAdmin) {
    navItems.push({
      to: '/users',
      labelKn: 'ಸಂಪಾದಕರ ನಿರ್ವಹಣೆ',
      labelEn: 'User Management',
      icon: <UserCheck className="w-4 h-4" />,
      badge: 'Admin'
    });
  }

  return (
    <div className="min-h-screen bg-brand-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-gold-500 selection:text-white">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-stone-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col p-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-stone-100 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 dark:bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-600/20">
                <BookOpen className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <span className="font-kannada font-bold text-base text-primary-600 dark:text-white block leading-tight">
                  ಕನ್ನಡ ಕಥಾ ಕೋಶ
                </span>
                <span className="text-[10px] font-semibold text-gold-600 dark:text-gold-500 uppercase tracking-widest">
                  Archival Repository
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Label */}
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
            ಮುಖ್ಯ ವಿಭಾಗಗಳು / Navigation
          </span>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all font-medium
                    ${
                      isActive
                        ? 'bg-primary-600 text-white font-semibold shadow-sm shadow-primary-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800/80 hover:text-primary-600 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-gold-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-kannada text-xs font-semibold leading-tight">{item.labelKn}</span>
                      <span className={`text-[10px] ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>{item.labelEn}</span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gold-500 text-slate-950 uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-stone-100 dark:border-slate-800 flex flex-col gap-3 bg-stone-50/60 dark:bg-slate-900/50">
          {/* Storage Mode info */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 mb-1">
              <span>ಸಂಗ್ರಹಣೆ (Storage)</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Local Driver
              </span>
            </div>
            <div className="text-[10px]">SQLite3 / UTF-8 Unicode</div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>ಲಾಗೌಟ್ (Sign Out)</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 w-full border-b border-stone-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-100 border border-primary-100 dark:border-slate-700">
              <span className="font-kannada">ಕಥಾ ಕೋಶ ಆಡಳಿತ ಕನ್ಸೋಲ್</span>
              <span className="text-slate-400">|</span>
              <span className="text-[11px] font-normal uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isAdmin ? 'Chief Archivist (Admin)' : 'Editorial Staff (Editor)'}
              </span>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            {/* Quick Add Story Button */}
            <Link
              to="/stories/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ ಹೊಸ ಕಥೆ (New Story)</span>
            </Link>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Chip */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200 dark:border-slate-800">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {currentUser?.name || 'ಡಾ. ಆನಂದ ಕುಮಾರ್'}
                </span>
                <span className="text-[10px] font-semibold text-gold-600 dark:text-gold-500 uppercase tracking-wider">
                  {currentUser?.role || 'Admin'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {(currentUser?.name || 'A').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
