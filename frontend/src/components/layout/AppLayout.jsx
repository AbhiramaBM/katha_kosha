import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  PenTool, 
  LayoutDashboard, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  PlusCircle, 
  UserCheck,
  Compass,
  Languages
} from 'lucide-react';
import { useAuth, useTheme, useLanguage } from '../../hooks';
import { LanguageToggle } from '../common/LanguageToggle';

export function AppLayout({ children }) {
  const { currentUser, logout, isAdmin, isReader, canEdit, isUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      to: '/dashboard',
      label: t('navHome'),
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      to: '/stories',
      label: t('navStories'),
      icon: <BookOpen className="w-4 h-4" />
    }
  ];

  // Editors & Admin only: New Story
  if (canEdit) {
    navItems.push({
      to: '/stories/new',
      label: t('navNewStory'),
      icon: <PenTool className="w-4 h-4" />
    });
  }

  // Authors directory
  navItems.push({
    to: '/authors',
    label: t('navAuthors'),
    icon: <Users className="w-4 h-4" />
  });

  // Admin-only nav item
  if (isAdmin) {
    navItems.push({
      to: '/users',
      label: t('navUsers'),
      icon: <UserCheck className="w-4 h-4" />
    });
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-stone-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col p-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-kannada font-bold text-sm text-slate-900 dark:text-white block leading-tight">
                  {t('appName')}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {t('appSubtitle')}
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <span className={isActive ? 'text-primary-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span className="font-kannada text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User details and Logout */}
        <div className="p-4 border-t border-stone-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                {(currentUser?.name || 'U').charAt(0)}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block truncate">
                  {currentUser?.name || t('userFallback')}
                </span>
                <span className="text-[10px] text-slate-400 block capitalize">
                  {currentUser?.role === 'admin'
                    ? t('roleAdmin')
                    : currentUser?.role === 'user'
                    ? t('roleUser')
                    : isReader
                    ? t('roleReader')
                    : t('roleEditor')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors w-full text-left font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-14 w-full border-b border-stone-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('openMenu')}
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="font-kannada text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">
              {t('headerTitle')}
            </span>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Add Story Button (if can edit) */}
            {canEdit ? (
              <Link
                to="/stories/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="font-kannada">+ {t('navNewStory')}</span>
              </Link>
            ) : null}

            {/* Language Toggle: Kannada ↔ English */}
            <LanguageToggle />

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('toggleTheme')}
              title={t('toggleTheme')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 max-w-6xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
