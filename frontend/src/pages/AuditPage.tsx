import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analytics.service';
import { AuditLog } from '../types';
import { History, Shield, User, Sparkles, ExternalLink, X, Search, Filter, Eye } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');

  useEffect(() => {
    analyticsService.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.actor_name && l.actor_name.toLowerCase().includes(search.toLowerCase())) ||
      l.entity_id.toLowerCase().includes(search.toLowerCase());
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
            Append-only immutable record of all human decisions, AI agent actions, assignments, and state transitions. Click any record to inspect full audit details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by action, actor, ID..."
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
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Entity Target</th>
              <th className="py-3.5 px-4">Metadata Payload</th>
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
                    {log.action}
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
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-400 hover:text-blue-300 hover:underline font-bold"
                    >
                      <span>{log.entity_type} ({log.entity_id.slice(0, 8)}...)</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400 max-w-xs truncate">
                    {JSON.stringify(log.new_value || log.metadata || {})}
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

      {/* Audit Detail Modal Inspector */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-base text-white">Audit Log Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-850">
                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Action Event</span>
                  <span className="font-black text-white text-sm uppercase">{selectedLog.action}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Actor Type & Name</span>
                  <span className="font-bold text-amber-300">{selectedLog.actor_name} ({selectedLog.actor_type})</span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Entity Target ID</span>
                  <span className="font-mono text-blue-400 font-bold">{selectedLog.entity_type}: {selectedLog.entity_id}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] font-mono uppercase">Recorded Timestamp</span>
                  <span className="font-mono text-neutral-300">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Formatted JSON Metadata / New Value */}
              <div>
                <span className="text-neutral-400 font-bold block mb-1">New Value / Action Payload:</span>
                <pre className="bg-black p-4 rounded-2xl border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.new_value || selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>

              {selectedLog.old_value && (
                <div>
                  <span className="text-neutral-400 font-bold block mb-1">Previous Value:</span>
                  <pre className="bg-black p-3 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-400 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.old_value, null, 2)}
                  </pre>
                </div>
              )}
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
                  <span>Open Target Incident ({selectedLog.entity_id.slice(0, 8)}...)</span>
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
