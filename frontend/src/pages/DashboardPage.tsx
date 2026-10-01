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
  BrainCircuit,
  PlusCircle,
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
    <div className="space-y-8">
      {/* Editorial Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
          <p className="text-base font-serif italic text-neutral-400">
            "Eliminating unclear ownership across urgent incidents through autonomous agent coordination."
          </p>
        </div>

        {['operator', 'supervisor', 'manager', 'admin'].includes(user?.role || '') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-black hover:bg-neutral-200 rounded-2xl text-xs font-black shadow-xl transition transform active:scale-95"
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

      {/* High Contrast KPI Cards (Light & Obsidian contrast inspired by reference screenshots) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-light p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-800 uppercase tracking-wider">
            <span>Unassigned Gap</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-4xl font-extrabold text-black">{overview?.kpi?.unassigned || 0}</div>
          <p className="text-xs font-serif italic text-neutral-600">Requires designated owner</p>
        </div>

        <div className="card-obsidian p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>Critical Severity</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-4xl font-extrabold text-amber-400">{overview?.kpi?.critical || 0}</div>
          <p className="text-xs font-serif italic text-neutral-400">Immediate response window</p>
        </div>

        <div className="card-obsidian p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>SLA At Risk</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-4xl font-extrabold text-rose-400">{overview?.kpi?.slaAtRisk || 0}</div>
          <p className="text-xs font-serif italic text-neutral-400">Approaching breach threshold</p>
        </div>

        <div className="card-light p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-800 uppercase tracking-wider">
            <span>In Progress Tasks</span>
            <UserCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-4xl font-extrabold text-black">{overview?.kpi?.inProgress || 0}</div>
          <p className="text-xs font-serif italic text-neutral-600">Active technician deployment</p>
        </div>
      </div>

      {/* Technician View */}
      {user?.role === 'technician' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>My Assigned Tasks ({myAssignedIncidents.length})</span>
          </h2>
          <IncidentTable incidents={myAssignedIncidents} />
        </div>
      )}

      {/* Operational Incident Queue View */}
      {user?.role !== 'technician' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-neutral-300" />
                <span>Operational Incident Queue</span>
              </h2>
              <p className="text-xs font-serif italic text-neutral-400">
                Real-time incident directory with automated owner assignment recommendations.
              </p>
            </div>

            <button
              onClick={() => navigate('/incidents')}
              className="btn-pill px-4 py-2 text-xs font-bold"
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
