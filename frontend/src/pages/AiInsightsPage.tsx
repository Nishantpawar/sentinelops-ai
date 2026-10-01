import React, { useState, useEffect } from 'react';
import { aiService } from '../services/ai.service';
import { AIAction } from '../types';
import { BrainCircuit, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AiInsightsPage: React.FC = () => {
  const [actions, setActions] = useState<AIAction[]>([]);

  useEffect(() => {
    aiService.getActions().then(setActions).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
          <span>Agentic AI Activity & Insights Center</span>
        </h1>
        <p className="text-xs text-slate-400">
          Complete audit stream of autonomous AI agent classifications, recommendations, and policy executions.
        </p>
      </div>

      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
            No AI agent actions executed yet.
          </div>
        ) : (
          actions.map((act) => (
            <div key={act.id} className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs text-white uppercase">{act.action_type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Agent: {act.agent_type}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono">
                {JSON.stringify(act.action_payload, null, 2)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Executed By: <strong className="text-slate-200">{act.executed_by}</strong></span>
                <span className="text-emerald-400 font-semibold uppercase">{act.execution_status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
