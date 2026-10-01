import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertOctagon,
  UserCheck,
  BrainCircuit,
  BarChart3,
  History,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Sidebar: React.FC<{ onOpenCreateModal: () => void }> = ({ onOpenCreateModal }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard, roles: ['operator', 'supervisor', 'technician', 'manager', 'admin'] },
    { label: t('incidents'), path: '/incidents', icon: AlertOctagon, roles: ['operator', 'supervisor', 'technician', 'manager', 'admin'] },
    { label: t('my_incidents'), path: '/my-incidents', icon: UserCheck, roles: ['operator', 'technician', 'supervisor'] },
    { label: t('ai_insights'), path: '/ai-insights', icon: BrainCircuit, roles: ['supervisor', 'manager', 'admin'] },
    { label: t('analytics'), path: '/analytics', icon: BarChart3, roles: ['manager', 'admin', 'supervisor'] },
    { label: t('audit'), path: '/audit', icon: History, roles: ['manager', 'admin', 'supervisor'] },
    { label: t('admin'), path: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const allowedNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-4">
        {/* Create Incident CTA */}
        {user && ['operator', 'supervisor', 'manager', 'admin'].includes(user.role) && (
          <button
            onClick={onOpenCreateModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('create_incident')}</span>
          </button>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Badge */}
      <div className="pt-4 border-t border-slate-850">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SentinelOps AI Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Agentic SLA & Ownership Monitoring Engine Running
          </p>
        </div>
      </div>
    </aside>
  );
};
