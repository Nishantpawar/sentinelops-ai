import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';
import { AuditLog } from '../types';
import { History, Shield, User, Sparkles } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    analyticsService.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          <span>System Audit & Traceability Logs</span>
        </h1>
        <p className="text-xs text-slate-400">
          Append-only immutable record of all human decisions, AI actions, assignments, and state transitions.
        </p>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">New Value / Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-850/60 transition">
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 font-semibold ${
                    log.actor_type === 'AI_AGENT' ? 'text-purple-400' : 'text-blue-400'
                  }`}>
                    {log.actor_type === 'AI_AGENT' ? <Sparkles className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {log.actor_name}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold uppercase tracking-wider text-slate-200 whitespace-nowrap">
                  {log.action}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  {log.entity_type} ({log.entity_id.slice(0, 8)}...)
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-300 max-w-xs truncate">
                  {JSON.stringify(log.new_value || log.metadata || {})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
