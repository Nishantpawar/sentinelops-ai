import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { SlaState } from '../../types';

export const SlaBadge: React.FC<{ slaDeadline?: string | null; state?: SlaState }> = ({
  slaDeadline,
  state = 'Healthy',
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [currentState, setCurrentState] = useState<SlaState>(state);

  useEffect(() => {
    if (!slaDeadline) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const deadline = new Date(slaDeadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('BREACHED');
        setCurrentState('Breached');
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (mins <= 30) {
          setCurrentState('At Risk');
        } else {
          setCurrentState('Healthy');
        }

        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        setTimeLeft(hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m ${secs}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [slaDeadline]);

  const config: Record<SlaState, { bg: string; text: string; icon: any; label: string }> = {
    Healthy: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', icon: ShieldCheck, label: 'Healthy' },
    'At Risk': { bg: 'bg-amber-500/20 border-amber-500/40 animate-pulse-subtle', text: 'text-amber-400', icon: AlertTriangle, label: 'At Risk' },
    Breached: { bg: 'bg-red-500/25 border-red-500/50 animate-pulse', text: 'text-red-300 font-bold', icon: AlertCircle, label: 'Breached' },
  };

  const current = config[currentState];
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${current.bg} ${current.text} text-xs font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
      {timeLeft && <span className="opacity-80 border-l border-current/30 pl-1.5 font-mono">{timeLeft}</span>}
    </div>
  );
};
