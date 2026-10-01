import React, { useState, useEffect } from 'react';
import { incidentService } from '../services/incident.service';
import { useAuth } from '../context/AuthContext';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { Incident } from '../types';
import { UserCheck } from 'lucide-react';

export const MyIncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    incidentService.getAll().then((data) => {
      const filtered = data.filter(
        (i) => i.assigned_to === user?.id || i.created_by === user?.id
      );
      setIncidents(filtered);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <span>My Incidents & Assigned Work</span>
        </h1>
        <p className="text-xs text-slate-400">View tasks you have created or are assigned to resolve.</p>
      </div>

      <IncidentTable incidents={incidents} />
    </div>
  );
};
