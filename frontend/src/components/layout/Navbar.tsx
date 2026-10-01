import React, { useState } from 'react';
import { Shield, Bell, Globe, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { RoleBadge } from '../common/Badge';
import { PreferredLanguage, UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const roles: UserRole[] = ['operator', 'supervisor', 'technician', 'manager', 'admin'];

  return (
    <header className="h-16 border-b border-neutral-850 bg-black/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white text-black rounded-xl font-bold">
          <Shield className="w-5 h-5 fill-black text-black" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
            SentinelOps AI
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-300">
              Agentic v1.0
            </span>
          </h1>
          <p className="text-xs font-serif italic text-neutral-400 hidden sm:block">
            Intelligent Incident Ownership & Coordination Platform
          </p>
        </div>
      </div>

      {/* Center Quick Role Switcher Pills */}
      <div className="hidden lg:flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-full px-3 py-1">
        <span className="text-xs text-neutral-400 font-medium">Demo Role:</span>
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => switchRole(r)}
            className={`px-3 py-1 text-xs font-bold rounded-full capitalize transition ${
              user?.role === r
                ? 'bg-white text-black shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Right Utility Actions */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="btn-pill px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-300" />
            <span className="uppercase">{language}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-1 z-50">
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
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span>{lang.label}</span>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="btn-pill p-2"
          >
            <Bell className="w-4 h-4 text-neutral-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black rounded-full text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <h3 className="font-bold text-sm text-white">Notifications</h3>
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono">
                  {notifications.length}
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">No notifications yet.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        n.status !== 'read'
                          ? 'bg-neutral-800/80 border-neutral-700 text-white'
                          : 'bg-neutral-950 border-neutral-850 text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{n.subject}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-1">{n.message}</p>
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
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900 hover:border-neutral-700 transition"
          >
            <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-extrabold text-xs">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-white leading-none">{user?.name}</div>
              <div className="mt-1">
                {user?.role && <RoleBadge role={user.role} />}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-4 py-2 border-b border-neutral-800">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Signed in as</p>
                <p className="text-xs font-bold text-white truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-neutral-800 flex items-center gap-2"
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
