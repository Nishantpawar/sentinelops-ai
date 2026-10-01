import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { SlaBadge } from '../common/SlaBadge';
import { Incident } from '../../types';
import { UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  onAssignClick?: (incident: Incident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents, onAssignClick }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur-md">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="py-3.5 px-4">Incident ID</th>
            <th className="py-3.5 px-4">Title & Details</th>
            <th className="py-3.5 px-4">Priority / Status</th>
            <th className="py-3.5 px-4">Owner / Team</th>
            <th className="py-3.5 px-4">SLA Risk</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {incidents.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                No incidents match current filter. All tasks have an active owner!
              </td>
            </tr>
          ) : (
            incidents.map((inc) => {
              const isUnassigned = !inc.assigned_to;
              const isUrgentUnassigned = isUnassigned && (inc.severity === 'critical' || inc.severity === 'high');

              return (
                <tr
                  key={inc.id}
                  className={`hover:bg-slate-850/60 transition cursor-pointer ${
                    isUrgentUnassigned ? 'bg-red-950/20 hover:bg-red-950/40' : ''
                  }`}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                    {inc.incident_number}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-white truncate">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                      <span>{inc.location}</span>
                      <span>•</span>
                      <span className="capitalize">{inc.category.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={inc.priority} />
                      <StatusBadge status={inc.status} />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {inc.assigned_to_name ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{inc.assigned_to_name}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30 text-[11px] animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> OWNER REQUIRED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <SlaBadge slaDeadline={inc.sla_deadline} state={inc.sla_state} />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {isUnassigned && onAssignClick ? (
                      <button
                        onClick={() => onAssignClick(inc)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs shadow"
                      >
                        Assign Owner
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
