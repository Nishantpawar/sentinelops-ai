import React from 'react';
import { AlertTriangle, UserPlus, ShieldAlert, ChevronRight } from 'lucide-react';
import { Incident } from '../../types';

interface OwnerRequiredBannerProps {
  unassignedIncidents: Incident[];
  onAssignClick: (incident: Incident) => void;
}

export const OwnerRequiredBanner: React.FC<OwnerRequiredBannerProps> = ({
  unassignedIncidents,
  onAssignClick,
}) => {
  if (unassignedIncidents.length === 0) return null;

  const urgentUnassigned = unassignedIncidents.filter(
    (i) => i.severity === 'critical' || i.severity === 'high'
  );

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-slate-900/90 to-red-950/90 border-2 border-red-500/50 rounded-2xl p-5 shadow-glow-red backdrop-blur-xl transition duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600/25 rounded-xl text-red-400 border border-red-500/40 animate-pulse shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-red-600 text-white font-black text-[11px] tracking-wider rounded-lg uppercase shadow-md">
                OWNER REQUIRED
              </span>
              <span className="text-white text-sm font-bold tracking-tight">
                {urgentUnassigned.length} Urgent Incident(s) Unassigned
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1.5 leading-relaxed max-w-2xl">
              SentinelOps AI detected unowned incidents. To prevent SLA breach and eliminate coordination ambiguity, assign a designated technician immediately.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
          {urgentUnassigned.slice(0, 2).map((inc) => (
            <button
              key={inc.id}
              onClick={() => onAssignClick(inc)}
              className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition transform active:scale-95 border border-red-400/40"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign {inc.incident_number}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
