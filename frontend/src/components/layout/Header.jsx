import React, { useState } from 'react';
import { Menu, Bell, Moon, Sun, Search, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export function Header({ onMenuClick, onOpenProfile }) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-xs w-64 focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search resources, tokens..."
            className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 w-full placeholder:text-slate-400"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Right: Actions & User Chip */}
      <div className="flex items-center gap-2.5">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all select-none"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {currentUser?.role || 'Member'}
              </span>
            </div>

            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                {(currentUser?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-slide-up"
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.email}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 w-full text-left"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile details</span>
                </button>
                <div className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified Account</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-full text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
