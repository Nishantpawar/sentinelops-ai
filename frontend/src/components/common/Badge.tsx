import React from 'react';
import { PriorityLevel, SeverityLevel, IncidentStatus, UserRole } from '../../types';

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const styles: Record<PriorityLevel, string> = {
    critical: 'bg-red-950 text-red-300 border-red-700/60 font-black tracking-wider uppercase',
    high: 'bg-amber-950 text-amber-300 border-amber-700/60 font-bold tracking-wider uppercase',
    medium: 'bg-yellow-950 text-yellow-300 border-yellow-700/60 font-semibold tracking-wider uppercase',
    low: 'bg-emerald-950 text-emerald-300 border-emerald-700/60 font-medium tracking-wider uppercase',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-mono ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const styles: Record<IncidentStatus, string> = {
    OPEN: 'bg-red-950 text-red-200 border-red-700 font-extrabold',
    ASSIGNED: 'bg-neutral-800 text-white border-neutral-600 font-bold',
    ACCEPTED: 'bg-neutral-800 text-white border-neutral-600 font-bold',
    IN_PROGRESS: 'bg-purple-950 text-purple-200 border-purple-700 font-bold',
    PENDING: 'bg-amber-950 text-amber-200 border-amber-700 font-semibold',
    ESCALATED: 'bg-rose-950 text-rose-200 border-rose-600 font-black animate-pulse',
    RESOLVED: 'bg-emerald-950 text-emerald-200 border-emerald-700 font-bold',
    REVIEW: 'bg-cyan-950 text-cyan-200 border-cyan-700 font-semibold',
    CLOSED: 'bg-neutral-900 text-neutral-400 border-neutral-800 font-medium',
    REJECTED: 'bg-neutral-900 text-neutral-400 border-neutral-800 font-medium',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] border tracking-tight ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    admin: 'bg-white text-black border-white font-black',
    manager: 'bg-neutral-200 text-black border-neutral-200 font-bold',
    supervisor: 'bg-neutral-800 text-white border-neutral-700 font-semibold',
    technician: 'bg-neutral-800 text-neutral-200 border-neutral-700 font-semibold',
    operator: 'bg-neutral-900 text-neutral-300 border-neutral-800 font-medium',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider border ${styles[role]}`}>
      {role}
    </span>
  );
};
