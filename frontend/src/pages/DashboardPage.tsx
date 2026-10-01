import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/incident.service';
import { analyticsService } from '../services/analytics.service';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { OwnerRequiredBanner } from '../components/common/OwnerRequiredBanner';
import { AssignmentModal } from '../components/assignments/AssignmentModal';
import { Incident } from '../types';
import {
  AlertTriangle,
  UserCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  BrainCircuit,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { IncidentCreateModal } from '../components/incidents/IncidentCreateModal';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState<Incident | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await incidentService.getAll();
      setIncidents(data);
      const ov = await analyticsService.getOverview();
      setOverview(ov);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const unassignedIncidents = incidents.filter((i) => !i.assigned_to && i.status !== 'CLOSED' && i.status !== 'RESOLVED');
  const myAssignedIncidents = incidents.filter((i) => i.assigned_to === user?.id && i.status !== 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">
              Welcome back, {user?.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
              Role: {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            SentinelOps AI Incident Ownership & Intelligent Coordination Command Center
          </p>
        </div>

        {['operator', 'supervisor', 'manager', 'admin'].includes(user?.role || '') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Incident</span>
          </button>
        )}
      </div>

      {/* Owner Required Banner for Unassigned Urgent Incidents */}
      {['supervisor', 'manager', 'admin'].includes(user?.role || '') && (
        <OwnerRequiredBanner
          unassignedIncidents={unassignedIncidents}
          onAssignClick={(inc) => setSelectedIncidentForAssign(inc)}
        />
      )}

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Unassigned (Ownership Gap)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">{overview?.kpi?.unassigned || 0}</div>
          <p className="text-[11px] text-slate-500">Requires designated owner</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Critical Severity</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-orange-400">{overview?.kpi?.critical || 0}</div>
          <p className="text-[11px] text-slate-500">Immediate response window</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>SLA At Risk / Breached</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{overview?.kpi?.slaAtRisk || 0}</div>
          <p className="text-[11px] text-slate-500">Approaching threshold</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>In Progress Tasks</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{overview?.kpi?.inProgress || 0}</div>
          <p className="text-[11px] text-slate-500">Active technician work</p>
        </div>
      </div>

      {/* Technician Specialized View */}
      {user?.role === 'technician' && (
        <div className="space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>My Assigned Tasks ({myAssignedIncidents.length})</span>
          </h2>
          <IncidentTable
            incidents={myAssignedIncidents}
          />
        </div>
      )}

      {/* Operational Incident Queue View */}
      {user?.role !== 'technician' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
              <span>Operational Incident Queue</span>
            </h2>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All ({incidents.length})
            </button>
          </div>

          <IncidentTable
            incidents={incidents.slice(0, 8)}
            onAssignClick={(inc) => setSelectedIncidentForAssign(inc)}
          />
        </div>
      )}

      {/* Assignment Modal */}
      {selectedIncidentForAssign && (
        <AssignmentModal
          incident={selectedIncidentForAssign}
          onClose={() => setSelectedIncidentForAssign(null)}
          onAssigned={fetchData}
        />
      )}

      {/* Incident Creation Modal */}
      {showCreateModal && (
        <IncidentCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
};
