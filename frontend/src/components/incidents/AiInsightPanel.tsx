import React, { useState } from 'react';
import { BrainCircuit, AlertTriangle, UserCheck, Bell, Check, X, ShieldCheck } from 'lucide-react';
import { aiService } from '../../services/ai.service';
import { Incident } from '../../types';

interface AiInsightPanelProps {
  incident: Incident;
  onAssigned?: () => void;
}

export const AiInsightPanel: React.FC<AiInsightPanelProps> = ({ incident, onAssigned }) => {
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  const handleWhyAtRisk = async () => {
    setLoadingRisk(true);
    try {
      const data = await aiService.whyAtRisk(incident.id);
      setRiskData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRisk(false);
    }
  };

  const handleRecommendOwner = async () => {
    setLoadingOwner(true);
    try {
      const data = await aiService.recommendOwner(incident.id);
      setOwnerData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOwner(false);
    }
  };

  const handleApproveOwner = async () => {
    if (!ownerData?.recommendedUserId) return;
    setApproving(true);
    try {
      await aiService.recommendOwner(incident.id);
      if (onAssigned) onAssigned();
    } catch (err) {
      alert('Failed to approve recommendation: ' + (err as any).message);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
          <BrainCircuit className="w-5 h-5 text-blue-500 animate-pulse-subtle" />
          <span>SentinelOps Agentic Intelligence Panel</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Autonomy Level 2 Assisted
        </span>
      </div>

      {/* Interactive Feature Trigger Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleWhyAtRisk}
          disabled={loadingRisk}
          className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{loadingRisk ? 'Analyzing SLA Risk...' : 'Why is this at risk?'}</span>
        </button>

        <button
          onClick={handleRecommendOwner}
          disabled={loadingOwner}
          className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
        >
          <UserCheck className="w-4 h-4 text-blue-400" />
          <span>{loadingOwner ? 'Evaluating Workload...' : 'Recommend Owner'}</span>
        </button>
      </div>

      {/* Risk Analysis Output */}
      {riskData && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2 text-xs">
          <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> SLA & Inactivity Risk Factors
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {riskData.reasons.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Owner Output with Approve Button */}
      {ownerData && (
        <div className="p-4 bg-blue-950/30 border border-blue-500/40 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
            <div>
              <span className="text-[10px] text-blue-400 font-mono uppercase">AI RECOMMENDATION</span>
              <h4 className="font-bold text-sm text-white">{ownerData.recommendedUserName}</h4>
              <p className="text-slate-400">{ownerData.recommendedTeamName} • Match Score: {ownerData.matchScore}%</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                {ownerData.workloadStatus}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">Decision Factors (Observable Data):</span>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5">
              {ownerData.reasoning.map((reason: string, idx: number) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setOwnerData(null)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-xs"
            >
              Dismiss
            </button>
            <button
              onClick={handleApproveOwner}
              disabled={approving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{approving ? 'Assigning...' : 'Approve & Assign Technician'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
