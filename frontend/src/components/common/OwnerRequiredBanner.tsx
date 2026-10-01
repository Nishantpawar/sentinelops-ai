import React from 'react';
import { UserPlus, ShieldAlert, ChevronRight } from 'lucide-react';
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
    <div className="card-highlight rounded-2xl p-6 shadow-2xl transition duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-black text-white rounded-xl font-bold animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-black text-white font-black text-[11px] tracking-widest rounded-full uppercase">
                OWNER REQUIRED
              </span>
              <span className="text-black text-base font-extrabold tracking-tight">
                {urgentUnassigned.length} Urgent Incident(s) Without Owner
              </span>
            </div>
            <p className="text-stone-900 text-xs mt-1.5 leading-relaxed font-serif italic max-w-2xl">
              "SentinelOps AI detected unowned urgent tasks. Assign a designated technician immediately to eliminate coordination delays and preserve SLA accountability."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
          {urgentUnassigned.slice(0, 2).map((inc) => (
            <button
              key={inc.id}
              onClick={() => onAssignClick(inc)}
              className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-stone-900 text-white rounded-xl text-xs font-bold shadow-lg transition transform active:scale-95"
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
