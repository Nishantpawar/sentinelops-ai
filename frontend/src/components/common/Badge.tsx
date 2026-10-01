import React from 'react';
import { PriorityLevel, SeverityLevel, IncidentStatus, UserRole } from '../../types';

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const styles: Record<PriorityLevel, string> = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/40 font-black shadow-glow-red animate-pulse-subtle',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/40 font-bold',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-semibold',
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-medium',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider border font-mono ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const styles: Record<IncidentStatus, string> = {
    OPEN: 'bg-red-500/10 text-red-400 border-red-500/30 font-extrabold',
    ASSIGNED: 'bg-blue-500/15 text-blue-400 border-blue-500/35 font-semibold',
    ACCEPTED: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/35 font-semibold',
    IN_PROGRESS: 'bg-purple-500/15 text-purple-300 border-purple-500/40 font-semibold',
    PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/35 font-medium',
    ESCALATED: 'bg-rose-600/25 text-rose-300 border-rose-500/50 font-black animate-pulse shadow-glow-red',
    RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 font-semibold',
    REVIEW: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35 font-semibold',
    CLOSED: 'bg-slate-800/80 text-slate-400 border-slate-700/50 font-medium',
    REJECTED: 'bg-gray-800/80 text-gray-400 border-gray-700/50 font-medium',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] border tracking-tight ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    admin: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold',
    manager: 'bg-purple-500/15 text-purple-300 border-purple-500/30 font-semibold',
    supervisor: 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-semibold',
    technician: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold',
    operator: 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-medium',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-mono tracking-wider border ${styles[role]}`}>
      {role}
    </span>
  );
};
