import React, { useState } from 'react';
import { Shield, Bell, Globe, User as UserIcon, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { RoleBadge } from '../common/Badge';
import { PreferredLanguage, UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const roles: UserRole[] = ['operator', 'supervisor', 'technician', 'manager', 'admin'];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
            SentinelOps AI
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30">
              v1.0 Agentic
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Agentic Incident Ownership & Intelligent Coordination Platform
          </p>
        </div>
      </div>

      {/* Center Quick Role Switcher for Demo & Testing */}
      <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
        <span className="text-xs text-slate-400 px-2 font-medium">Demo Role:</span>
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => switchRole(r)}
            className={`px-2.5 py-1 text-xs font-semibold rounded capitalize transition ${
              user?.role === r
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Right User & Utility Actions */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-medium"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="uppercase">{language}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'mr', label: 'मराठी (Marathi)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as PreferredLanguage);
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>{lang.label}</span>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <span>Notifications</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                    {notifications.length}
                  </span>
                </h3>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 rounded-lg border transition cursor-pointer ${
                        n.status !== 'read'
                          ? 'bg-blue-950/30 border-blue-500/30'
                          : 'bg-slate-950/40 border-slate-800 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-400">{n.subject}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 transition"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-white leading-none">{user?.name}</div>
              <div className="mt-1">
                {user?.role && <RoleBadge role={user.role} />}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
