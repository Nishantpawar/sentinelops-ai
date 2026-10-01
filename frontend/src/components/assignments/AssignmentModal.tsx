import React, { useState, useEffect } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';
import { incidentService } from '../../services/incident.service';
import { adminService } from '../../services/admin.service';
import { Incident, User } from '../../types';

interface AssignmentModalProps {
  incident: Incident;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  incident,
  onClose,
  onAssigned,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [reason, setReason] = useState('Workload capacity & skill domain match.');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminService.getUsers().then((data: User[]) => {
      setUsers(data.filter((u) => u.role === 'technician'));
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;
    setSubmitting(true);
    try {
      await incidentService.assignTechnician(incident.id, selectedTech, reason);
      onAssigned();
      onClose();
    } catch (err) {
      alert('Assignment failed: ' + (err as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Assign Technician to {incident.incident_number}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Qualified Technician</label>
            <select
              required
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Technician --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.team_name || 'Maintenance'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Rationale</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedTech}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
