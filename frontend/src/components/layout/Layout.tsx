import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { IncidentCreateModal } from '../incidents/IncidentCreateModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar onOpenCreateModal={() => setShowCreateModal(true)} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {showCreateModal && (
        <IncidentCreateModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
