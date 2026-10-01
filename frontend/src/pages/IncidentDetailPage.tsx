import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentService } from '../services/incident.service';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { SlaBadge } from '../components/common/SlaBadge';
import { AiInsightPanel } from '../components/incidents/AiInsightPanel';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { AssignmentModal } from '../components/assignments/AssignmentModal';
import { Incident, IncidentUpdate, AuditLog, DirectMessage } from '../types';
import {
  UserCheck,
  AlertTriangle,
  Send,
  CheckCircle2,
  Play,
  FileText,
  MapPin,
  Clock,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const inc = await incidentService.getById(id);
      setIncident(inc);
      const up = await incidentService.getUpdates(id);
      setUpdates(up);
      const ms = await incidentService.getMessages(id);
      setMessages(ms);
      const logs = await analyticsService.getAuditLogs();
      setAuditLogs(logs.filter((l) => l.entity_id === id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading || !incident) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Incident Command Center...
      </div>
    );
  }

  const isAssignedToMe = incident.assigned_to === user?.id;
  const isSupervisorOrAdmin = ['supervisor', 'manager', 'admin'].includes(user?.role || '');

  const handleStartWork = async () => {
    try {
      await incidentService.updateStatus(incident.id, 'IN_PROGRESS', 'Technician initiated diagnostics & repair.');
      fetchDetail();
    } catch (err) {
      alert((err as any).message);
    }
  };

  const handlePostProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressMsg) return;
    try {
      await incidentService.postUpdate(incident.id, progressMsg, 'PROGRESS');
      setProgressMsg('');
      fetchDetail();
    } catch (err) {
      alert((err as any).message);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg) return;
    try {
      await incidentService.postMessage(incident.id, chatMsg);
      setChatMsg('');
      fetchDetail();
    } catch (err) {
      alert((err as any).message);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes) return;
    setResolving(true);
    try {
      await incidentService.updateStatus(incident.id, 'RESOLVED', resolutionNotes);
      fetchDetail();
    } catch (err) {
      alert((err as any).message);
    } finally {
      setResolving(false);
    }
  };

  const handleApproveResolution = async () => {
    try {
      await incidentService.updateStatus(incident.id, 'CLOSED', 'Supervisor verified & approved resolution.');
      fetchDetail();
    } catch (err) {
      alert((err as any).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Incident Command Center Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-blue-400">{incident.incident_number}</span>
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold text-white mt-1">{incident.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-400" /> {incident.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-blue-400" /> {incident.category}</span>
              <span>•</span>
              <span>Language: <strong className="uppercase text-slate-200">{incident.original_language}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SlaBadge slaDeadline={incident.sla_deadline} state={incident.sla_state} />
            {isSupervisorOrAdmin && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow"
              >
                {incident.assigned_to ? 'Reassign Owner' : 'Assign Owner'}
              </button>
            )}
          </div>
        </div>

        {/* Ownership Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block mb-1">Designated Owner:</span>
            {incident.assigned_to_name ? (
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                <UserCheck className="w-4 h-4" /> {incident.assigned_to_name}
              </span>
            ) : (
              <span className="font-bold text-red-400 flex items-center gap-1.5 text-sm animate-pulse">
                <AlertTriangle className="w-4 h-4" /> OWNER REQUIRED
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block mb-1">Assigned Operational Team:</span>
            <span className="font-semibold text-white">{incident.assigned_team_name || 'Maintenance Team'}</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block mb-1">Reporter:</span>
            <span className="font-semibold text-slate-300">{incident.created_by_name}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Actions, Right AI Panel & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Actions & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-2">
            <h3 className="font-bold text-sm text-white">Incident Description & Context</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
          </div>

          {/* Technician Action Bar */}
          {(isAssignedToMe || isSupervisorOrAdmin) && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Operational Control & Progress Action</span>
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                {incident.status === 'ASSIGNED' && (
                  <button
                    onClick={handleStartWork}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow"
                  >
                    <Play className="w-4 h-4" /> Start Work
                  </button>
                )}

                {incident.status === 'RESOLVED' && isSupervisorOrAdmin && (
                  <button
                    onClick={handleApproveResolution}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Close Resolution
                  </button>
                )}
              </div>

              {/* Post Progress Update Form */}
              <form onSubmit={handlePostProgress} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post technical update or progress note..."
                  value={progressMsg}
                  onChange={(e) => setProgressMsg(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
                >
                  Post Note
                </button>
              </form>

              {/* Resolve Form */}
              {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
                <form onSubmit={handleResolve} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="font-semibold text-xs text-white">Mark Incident Resolved</h4>
                  <textarea
                    rows={2}
                    placeholder="Enter detailed technical resolution steps..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={resolving || !resolutionNotes}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow disabled:opacity-50"
                    >
                      {resolving ? 'Submitting Resolution...' : 'Submit Resolution for Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Traceability Timeline */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <IncidentTimeline updates={updates} auditLogs={auditLogs} />
          </div>
        </div>

        {/* Right Col: Agentic AI Panel & Direct Messaging */}
        <div className="space-y-6">
          {/* Agentic AI Insight Panel */}
          <AiInsightPanel incident={incident} onAssigned={fetchDetail} />

          {/* Direct Incident Messaging Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Incident Operational Messages</span>
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No operational chat messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-blue-400">{m.sender_name}</span>
                      <span className="font-mono">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-200">{m.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Type operational message..."
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {showAssignModal && (
        <AssignmentModal
          incident={incident}
          onClose={() => setShowAssignModal(false)}
          onAssigned={fetchDetail}
        />
      )}
    </div>
  );
};
