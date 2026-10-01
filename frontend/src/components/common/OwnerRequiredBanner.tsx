import React from 'react';
import { AlertCircle, UserPlus, Zap } from 'lucide-react';
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
    <div className="bg-gradient-to-r from-red-950/80 via-rose-900/60 to-red-950/80 border-2 border-red-500/60 rounded-xl p-4 mb-6 shadow-2xl shadow-red-950/50 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-600/30 rounded-lg text-red-400 border border-red-500/40 animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-xs tracking-wider rounded uppercase">
                OWNER REQUIRED
              </span>
              <span className="text-red-300 text-sm font-semibold">
                {urgentUnassigned.length} Urgent Incident(s) Without Owner
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1">
              SentinelOps AI has flagged unassigned incidents at risk of SLA breach. Immediate technician assignment is required to establish accountability.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {urgentUnassigned.slice(0, 2).map((inc) => (
            <button
              key={inc.id}
              onClick={() => onAssignClick(inc)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow transition transform active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign {inc.incident_number}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
