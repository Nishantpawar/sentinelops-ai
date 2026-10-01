import React, { useState, useEffect } from 'react';
import { aiService } from '../services/ai.service';
import { incidentService } from '../services/incident.service';
import { AIAction, Incident } from '../types';
import { BrainCircuit, Sparkles, CheckCircle2, ShieldAlert, Bot, UserPlus, AlertTriangle } from 'lucide-react';
import { AiAgentCopilot } from '../components/ai/AiAgentCopilot';

export const AiInsightsPage: React.FC = () => {
  const [actions, setActions] = useState<AIAction[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const refreshData = () => {
    aiService.getActions().then(setActions).catch(console.error);
    incidentService.getAll().then(setIncidents).catch(console.error);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-white" />
          <span>Agentic AI Activity & Insights Center</span>
        </h1>
        <p className="text-xs font-serif italic text-neutral-400 mt-1">
          Interactive AI Agent Copilot & complete audit stream of autonomous agent classifications, recommendations, and policy executions.
        </p>
      </div>

      {/* Embedded Interactive AI Agent Copilot */}
      <AiAgentCopilot incidents={incidents} onActionTriggered={refreshData} />

      {/* Recorded AI Agent Executions Stream */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>AI Agent Action Execution Stream</span>
        </h3>

        {actions.length === 0 ? (
          <div className="p-8 card-obsidian rounded-2xl text-center text-neutral-500 text-xs">
            No background AI agent actions recorded yet.
          </div>
        ) : (
          actions.map((act) => {
            const isEscalation = act.action_type.includes('ESCALATE');

            return (
              <div
                key={act.id}
                className="card-obsidian p-6 rounded-2xl space-y-3 shadow-xl transition hover:border-neutral-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-850 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        isEscalation
                          ? 'bg-rose-950 text-rose-300 border border-rose-700'
                          : 'bg-white text-black font-black'
                      }`}
                    >
                      {act.action_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300">
                      Agent: {act.agent_type}
                    </span>
                  </div>

                  <span className="text-xs text-neutral-400 font-mono">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Formatted Operational Action Insights */}
                <div className="space-y-2 text-xs text-neutral-200 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase tracking-wider font-mono">Target Recipient / Incident:</span>
                      <span className="font-bold text-white text-xs">
                        {act.action_payload?.subject || (act.action_payload?.recipientId ? 'Supervisor / Technical Lead' : 'System Alert')}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase tracking-wider font-mono">Operational Reason:</span>
                      <span className="font-serif italic text-neutral-300 text-xs">
                        "{act.action_payload?.reason || 'SLA window approaching breach threshold threshold.'}"
                      </span>
                    </div>
                  </div>

                  {act.action_payload?.message && (
                    <div className="pt-2 border-t border-neutral-850">
                      <span className="text-neutral-500 block text-[10px] uppercase tracking-wider font-mono">Drafted Message:</span>
                      <p className="text-neutral-300 mt-0.5">{act.action_payload.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-400">
                    Executed By: <strong className="text-white">{act.executed_by}</strong>
                  </span>
                  <span
                    className={`font-mono font-bold text-xs uppercase ${
                      act.execution_status === 'SUCCESS'
                        ? 'text-emerald-400'
                        : act.execution_status === 'PENDING_APPROVAL'
                        ? 'text-amber-300'
                        : 'text-red-400'
                    }`}
                  >
                    ● {act.execution_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
