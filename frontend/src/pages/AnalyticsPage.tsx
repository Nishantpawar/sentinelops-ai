import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';
import { BarChart3, TrendingUp, ShieldCheck, Clock, BrainCircuit } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [slaData, setSlaData] = useState<any>(null);
  const [workloadData, setWorkloadData] = useState<any[]>([]);
  const [aiMetrics, setAiMetrics] = useState<any>(null);

  useEffect(() => {
    analyticsService.getOverview().then(setOverview).catch(console.error);
    analyticsService.getSla().then(setSlaData).catch(console.error);
    analyticsService.getWorkload().then(setWorkloadData).catch(console.error);
    analyticsService.getAiMetrics().then(setAiMetrics).catch(console.error);
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Management Analytics & SLA Compliance</span>
        </h1>
        <p className="text-xs text-slate-400">Real-time measurements calculated directly from database records.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-medium">SLA Compliance Rate</div>
          <div className="text-2xl font-extrabold text-emerald-400">{slaData?.complianceRate || 100}%</div>
          <p className="text-[11px] text-slate-500">Target: &gt;95%</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-medium">Ownership Gap %</div>
          <div className="text-2xl font-extrabold text-red-400">{overview?.kpi?.ownershipGapPercentage || 0}%</div>
          <p className="text-[11px] text-slate-500">Unassigned / Total</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-medium">AI Rec Approval Rate</div>
          <div className="text-2xl font-extrabold text-purple-400">{aiMetrics?.approvalRate || 100}%</div>
          <p className="text-[11px] text-slate-500">Supervisor Approved</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total AI Actions Executed</div>
          <div className="text-2xl font-extrabold text-blue-400">{aiMetrics?.totalActions || 0}</div>
          <p className="text-[11px] text-slate-500">Controlled Policy Engine</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Distribution Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <h3 className="font-bold text-sm text-white">Technician Active Workload Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="activeCount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Incidents" />
                <Bar dataKey="resolvedCount" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <h3 className="font-bold text-sm text-white">Incident Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview?.categoryDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.name}
                >
                  {(overview?.categoryDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
