import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  UserCheck,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Zap,
  MessageSquare,
  X,
} from 'lucide-react';
import { aiService } from '../../services/ai.service';
import { incidentService } from '../../services/incident.service';
import { Incident } from '../../types';

interface AiAgentCopilotProps {
  incidents?: Incident[];
  onActionTriggered?: () => void;
}

export const AiAgentCopilot: React.FC<AiAgentCopilotProps> = ({
  incidents = [],
  onActionTriggered,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: 'user' | 'agent';
      agentName?: string;
      text: string;
      actionPayload?: any;
      confidence?: number;
      timestamp: string;
    }>
  >([
    {
      id: 'welcome',
      sender: 'agent',
      agentName: 'SentinelOps AI Orchestrator',
      text: 'Hello! I am SentinelOps AI Agent. I monitor active incidents, detect SLA risks, evaluate technician workload capacity, and draft localized operational communications in English, Hindi, and Marathi. How can I assist you?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendPrompt = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || prompt;
    if (!query.trim()) return;

    const userMsgId = Date.now().toString();
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user' as const,
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMessages);
    if (!customQuery) setPrompt('');
    setLoading(true);

    try {
      // Analyze user intent
      const lower = query.toLowerCase();
      let agentResponse = '';
      let agentName = 'SentinelOps AI Orchestrator';
      let payload: any = null;
      let confidence = 0.94;

      if (lower.includes('unassigned') || lower.includes('owner') || lower.includes('who should handle')) {
        const unassigned = incidents.find((i) => !i.assigned_to) || incidents[0];
        if (unassigned) {
          agentName = 'Ownership Agent';
          const rec = await aiService.recommendOwner(unassigned.id);
          payload = rec;
          agentResponse = `I evaluated active workload capacity and technical skill profiles for incident ${unassigned.incident_number} ("${unassigned.title}"). Recommended Owner: ${rec.recommendedUserName} (${rec.recommendedTeamName}) with a match score of ${rec.matchScore}%.`;
        } else {
          agentResponse = 'All active incidents currently have a designated owner! SLA ownership gap is 0%.';
        }
      } else if (lower.includes('risk') || lower.includes('sla') || lower.includes('why')) {
        const targetInc = incidents[0];
        if (targetInc) {
          agentName = 'Escalation Agent';
          const riskData = await aiService.whyAtRisk(targetInc.id);
          payload = riskData;
          agentResponse = `SLA Risk Analysis for ${targetInc.incident_number}: ${riskData.reasons.join(' ')}`;
        } else {
          agentResponse = 'No high SLA risks detected across current operational queues.';
        }
      } else {
        // General Agentic AI operational response
        const sampleText = incidents[0] ? `${incidents[0].title} - ${incidents[0].description}` : query;
        const analysis = await aiService.analyzeIncident(sampleText, 'Operational Inquiry');
        payload = analysis;
        agentName = 'Incident Analysis Agent';
        agentResponse = `AI Analysis: Category [${analysis.category.toUpperCase()}], Urgency [${analysis.urgency.toUpperCase()}], Severity [${analysis.severity.toUpperCase()}]. Recommended Action: ${analysis.recommendedAction}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          agentName,
          text: agentResponse,
          actionPayload: payload,
          confidence,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          agentName: 'SentinelOps AI System',
          text: 'AI Agent analysis temporarily degraded. Continuing manual operational workflows.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const executeQuickCommand = (cmd: string) => {
    handleSendPrompt(undefined, cmd);
  };

  return (
    <div className="card-obsidian rounded-3xl p-6 shadow-2xl border border-neutral-800 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-black rounded-2xl font-bold shadow-glow-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">SentinelOps Agentic AI Assistant</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono uppercase font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Agent Loop
              </span>
            </div>
            <p className="text-xs font-serif italic text-neutral-400 mt-0.5">
              Autonomous coordination, technician workload matching & SLA risk prevention.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="btn-pill p-2 text-neutral-400 hover:text-white"
          title="Reset Agent Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Prompt Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => executeQuickCommand('Which unassigned incidents need an owner?')}
          className="btn-pill px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Recommend Owner for Unassigned</span>
        </button>

        <button
          onClick={() => executeQuickCommand('Why is the incident at SLA risk?')}
          className="btn-pill px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Evaluate SLA Breach Risk</span>
        </button>

        <button
          onClick={() => executeQuickCommand('Analyze operational workload')}
          className="btn-pill px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Analyze Technician Capacity</span>
        </button>
      </div>

      {/* Agent Chat Window */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-1 border-t border-b border-neutral-850 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl space-y-2 text-xs ${
                m.sender === 'user'
                  ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-1.5 text-[11px]">
                <span className="font-extrabold flex items-center gap-1.5 text-white">
                  {m.sender === 'agent' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{m.agentName || 'SentinelOps AI Agent'}</span>
                    </>
                  ) : (
                    'You (Operator / Supervisor)'
                  )}
                </span>
                <span className="text-neutral-500 font-mono text-[10px]">{m.timestamp}</span>
              </div>

              <p className="leading-relaxed font-sans">{m.text}</p>

              {/* Action Payload Card if Agent generated explicit recommendation */}
              {m.actionPayload && m.actionPayload.recommendedUserName && (
                <div className="card-highlight p-3.5 rounded-xl space-y-2 text-xs mt-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-black uppercase tracking-wider text-[10px]">RECOMMENDED OWNER</span>
                    <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-mono">
                      Match: {m.actionPayload.matchScore}%
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-black">
                    {m.actionPayload.recommendedUserName} ({m.actionPayload.recommendedTeamName})
                  </div>
                  <ul className="list-disc list-inside text-stone-900 font-serif italic text-[11px] space-y-0.5">
                    {m.actionPayload.reasoning?.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="font-serif italic">SentinelOps Agent is reasoning and building operational context...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendPrompt} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask SentinelOps AI Agent (e.g. 'Analyze unassigned tasks', 'Recommend owner for INC-1001')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="btn-black px-5 py-3 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask Agent</span>
        </button>
      </form>
    </div>
  );
};
