import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analytics.service';
import { AuditLog } from '../types';
import { History, User, Sparkles, ExternalLink, X, Search, Eye, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');

  useEffect(() => {
    analyticsService.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  // Format raw payload into clean human operational text
  const formatHumanSummary = (log: AuditLog): string => {
    const val = log.new_value || log.metadata || {};
    const payload = val.payload || val;

    if (log.action.includes('ESCALATE')) {
      return payload.reason
        ? `Escalation alert triggered. Reason: ${payload.reason}`
        : 'SLA risk escalation alert dispatched to Supervisor.';
    }
    if (log.action.includes('ASSIGN')) {
      return val.assigned_to
        ? `Assigned designated technician owner.`
        : 'Technician assignment recorded.';
    }
    if (log.action.includes('CLASSIFY')) {
      return `AI classification: ${val.category || 'Equipment Failure'} (${val.severity || 'Critical'} Severity).`;
    }
    if (log.action.includes('CREATE')) {
      return val.title ? `Created incident "${val.title}".` : 'New operational incident logged.';
    }
    if (log.action.includes('APPROVE') || log.action.includes('REJECT')) {
      return `Supervisor review status: ${log.action.replace(/_/g, ' ')}.`;
    }
    return payload.reason || payload.subject || payload.message || 'Operational state event recorded.';
  };

  const filteredLogs = logs.filter((l) => {
    const humanText = formatHumanSummary(l);
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.actor_name && l.actor_name.toLowerCase().includes(search.toLowerCase())) ||
      humanText.toLowerCase().includes(search.toLowerCase());
    const matchesActor = actorFilter === 'ALL' || l.actor_type === actorFilter;
    return matchesSearch && matchesActor;
  });

  return (
    <div className="space-y-6">
      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-white" />
            <span>System Audit & Traceability Logs</span>
          </h1>
          <p className="text-xs font-serif italic text-neutral-400 mt-1">
            Append-only immutable record of human decisions, AI agent actions, assignments, and state transitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter events or actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
          >
            <option value="ALL">All Actors</option>
            <option value="AI_AGENT">AI Agent</option>
            <option value="USER">User</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto border border-neutral-800 rounded-2xl card-obsidian backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-black text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Actor</th>
              <th className="py-3.5 px-4">Action Event</th>
              <th className="py-3.5 px-4">Target Entity</th>
              <th className="py-3.5 px-4">Operational Summary</th>
              <th className="py-3.5 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-850 text-neutral-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-500 font-serif italic text-xs">
                  No matching audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-neutral-900/80 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold ${
                        log.actor_type === 'AI_AGENT'
                          ? 'text-amber-300'
                          : log.actor_type === 'USER'
                          ? 'text-white'
                          : 'text-neutral-400'
                      }`}
                    >
                      {log.actor_type === 'AI_AGENT' ? <Sparkles className="w-3.5 h-3.5 text-amber-300" /> : <User className="w-3.5 h-3.5" />}
                      {log.actor_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black uppercase tracking-wider text-white whitespace-nowrap">
                    {log.action.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (log.entity_type === 'INCIDENT') {
                          navigate(`/incidents/${log.entity_id}`);
                        } else {
                          setSelectedLog(log);
                        }
                      }}
                      className="inline-flex items-center gap-1 font-bold text-xs text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <span>Open Incident</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-neutral-300 max-w-sm truncate font-sans">
                    {formatHumanSummary(log)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                      title="Inspect Audit Record"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Human-Readable Audit Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-base text-white">Audit Event Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-850">
                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Event Action</span>
                  <span className="font-black text-white text-sm uppercase">{selectedLog.action.replace(/_/g, ' ')}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Actor</span>
                  <span className="font-bold text-amber-300">{selectedLog.actor_name} ({selectedLog.actor_type})</span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Target Entity</span>
                  <span className="font-bold text-blue-400">{selectedLog.entity_type} Record</span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Recorded Timestamp</span>
                  <span className="font-mono text-neutral-300">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Formatted Operational Details Card (No Raw JSON) */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 space-y-3">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">Operational Summary</h4>
                <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                  {formatHumanSummary(selectedLog)}
                </p>

                {(selectedLog.new_value?.payload?.subject || selectedLog.metadata?.agentType) && (
                  <div className="pt-3 border-t border-neutral-850 space-y-2 text-xs">
                    {selectedLog.metadata?.agentType && (
                      <div>
                        <span className="text-neutral-500 block text-[10px] font-mono uppercase">Originating Agent</span>
                        <span className="font-bold text-amber-300">{selectedLog.metadata.agentType}</span>
                      </div>
                    )}

                    {selectedLog.new_value?.payload?.subject && (
                      <div>
                        <span className="text-neutral-500 block text-[10px] font-mono uppercase">Alert Subject</span>
                        <span className="font-semibold text-white">{selectedLog.new_value.payload.subject}</span>
                      </div>
                    )}

                    {selectedLog.new_value?.payload?.message && (
                      <div>
                        <span className="text-neutral-500 block text-[10px] font-mono uppercase">Alert Message Content</span>
                        <p className="text-neutral-300 italic">{selectedLog.new_value.payload.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              {selectedLog.entity_type === 'INCIDENT' ? (
                <button
                  onClick={() => {
                    const incId = selectedLog.entity_id;
                    setSelectedLog(null);
                    navigate(`/incidents/${incId}`);
                  }}
                  className="btn-black px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Target Incident Command Center</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setSelectedLog(null)}
                className="btn-pill px-4 py-2 text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
