import React from 'react';
import { PriorityLevel, SeverityLevel, IncidentStatus, UserRole } from '../../types';

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const styles: Record<PriorityLevel, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse-subtle',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const styles: Record<IncidentStatus, string> = {
    OPEN: 'bg-red-500/10 text-red-400 border-red-500/20 font-bold',
    ASSIGNED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ACCEPTED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ESCALATED: 'bg-rose-600/30 text-rose-300 border-rose-500/50 animate-pulse',
    RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    REVIEW: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    CLOSED: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
    REJECTED: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    manager: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    supervisor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    technician: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    operator: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${styles[role]}`}>
      {role}
    </span>
  );
};
