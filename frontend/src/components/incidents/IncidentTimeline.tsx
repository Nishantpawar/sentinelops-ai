import React from 'react';
import { Sparkles, CheckCircle2, User, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import { IncidentUpdate, AuditLog } from '../../types';

interface IncidentTimelineProps {
  updates: IncidentUpdate[];
  auditLogs: AuditLog[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ updates, auditLogs }) => {
  // Combine updates and audit logs chronologically
  const timelineEvents = [
    ...updates.map((u) => ({
      id: u.id,
      timestamp: u.created_at,
      title: u.update_type.replace('_', ' '),
      description: u.message,
      author: u.user_name || 'System User',
      type: u.user_role === 'supervisor' ? 'HUMAN_APPROVED' : 'HUMAN_ACTION',
    })),
    ...auditLogs.map((a) => {
      let type = 'SYSTEM_EVENT';
      if (a.actor_type === 'AI_AGENT') {
        type = a.action.startsWith('AI_ACTION') ? 'AI_EXECUTED' : 'AI_RECOMMENDATION';
      } else if (a.action.includes('ASSIGN') || a.action.includes('APPROVE')) {
        type = 'HUMAN_APPROVED';
      }

      const humanDesc =
        a.metadata?.policyReason ||
        a.new_value?.summary ||
        (typeof a.new_value === 'string' ? a.new_value : null) ||
        a.new_value?.payload?.reason ||
        a.new_value?.payload?.message ||
        a.new_value?.payload?.subject ||
        a.new_value?.title ||
        'Operational system action recorded.';

      return {
        id: a.id,
        timestamp: a.created_at,
        title: a.action.replace(/_/g, ' '),
        description: humanDesc,
        author: a.actor_name || 'SentinelOps System',
        type,
      };
    }),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'AI_RECOMMENDATION':
        return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'AI RECOMMENDATION', icon: Sparkles };
      case 'AI_EXECUTED':
        return { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', label: 'AI EXECUTED', icon: Sparkles };
      case 'HUMAN_APPROVED':
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'HUMAN APPROVED', icon: CheckCircle2 };
      default:
        return { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: 'SYSTEM EVENT', icon: Clock };
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-white flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-400" />
        <span>Incident Lifecycle Traceability Timeline</span>
      </h3>

      <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-6">
        {timelineEvents.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No timeline events recorded yet.</p>
        ) : (
          timelineEvents.map((evt) => {
            const tag = getTagStyle(evt.type);
            const Icon = tag.icon;

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-blue-500 group-hover:scale-125 transition"></div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${tag.bg}`}>
                      <Icon className="w-3 h-3" /> {tag.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-white">{evt.title}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 flex items-center justify-between">
                    <span>Actor: <strong className="text-slate-200">{evt.author}</strong></span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
