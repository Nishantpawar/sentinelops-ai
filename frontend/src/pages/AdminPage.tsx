import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { Settings, Users, Shield, Clock } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [slaPolicies, setSlaPolicies] = useState<any[]>([]);

  useEffect(() => {
    adminService.getUsers().then(setUsers).catch(console.error);
    adminService.getSla().then(setSlaPolicies).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Admin System Configuration</span>
        </h1>
        <p className="text-xs text-slate-400">Manage users, teams, and active SLA policies.</p>
      </div>

      {/* User Management Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span>User & Role Directory ({users.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 px-3 font-semibold">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{u.email}</td>
                  <td className="py-2.5 px-3 uppercase font-bold text-blue-400">{u.role}</td>
                  <td className="py-2.5 px-3 uppercase">{u.preferred_language}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLA Policy Management */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Active SLA Policies Configuration</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slaPolicies.map((p) => (
            <div key={p.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">{p.name}</h4>
              <div className="flex items-center justify-between text-slate-400">
                <span>Priority: <strong className="uppercase text-amber-400">{p.priority}</strong></span>
                <span>Severity: <strong className="uppercase text-red-400">{p.severity}</strong></span>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                <div>Response Target: <strong>{p.response_minutes} min</strong></div>
                <div>Resolution Target: <strong>{p.resolution_minutes} min ({p.resolution_minutes / 60} hrs)</strong></div>
                <div>Escalation Threshold: <strong>{p.escalation_minutes} min</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
