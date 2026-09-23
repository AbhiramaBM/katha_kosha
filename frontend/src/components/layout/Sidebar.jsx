import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  User, 
  Key, 
  Activity, 
  Settings, 
  LogOut, 
  X 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar({ isOpen, onClose, activeTab, onSelectTab }) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'User Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Tokens', icon: <Key className="w-4 h-4" /> },
    { id: 'audit', label: 'Session Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Top: Logo & Navigation */}
        <div className="flex flex-col p-4">
          {/* Logo */}
          <div className="flex items-center justify-between px-3 py-3 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  NexusAuth
                </span>
                <span className="block text-[9px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                  Console v1.0
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left
                    ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }
                  `}
                >
                  <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: System Status Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
              <span>Auth Status</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <span>Token refresh: Automated</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
