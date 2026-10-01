import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Sparkles, LogIn, Key, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('supervisor@example.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts: Array<{ role: UserRole; name: string; email: string; desc: string }> = [
    { role: 'operator', name: 'Aarav Patel', email: 'operator@example.com', desc: 'Creates incidents, inputs natural language' },
    { role: 'supervisor', name: 'Rajesh Sharma', email: 'supervisor@example.com', desc: 'Operational queue, reviews AI, assigns techs' },
    { role: 'technician', name: 'Alex Rivera', email: 'technician1@example.com', desc: 'Accepts tasks, posts progress, resolves' },
    { role: 'manager', name: 'Eleanor Vance', email: 'manager@example.com', desc: 'Analytics, SLA metrics & AI traceability' },
    { role: 'admin', name: 'System Admin', email: 'admin@example.com', desc: 'User management & SLA policy settings' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-500/20 mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">SentinelOps AI</h2>
        <p className="mt-1 text-xs text-slate-400">
          Agentic Incident Ownership & Intelligent Coordination Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Platform'}
            </button>
          </form>

          {/* 1-Click Demo Credentials Panel */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
              <span>1-Click Hackathon Demo Login</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </h4>
            <div className="space-y-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickPreset(acc.email)}
                  className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition ${
                    email === acc.email
                      ? 'bg-blue-600/20 border-blue-500/50 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <span className="capitalize text-blue-400 font-bold">{acc.role}: </span>
                    <span>{acc.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Select</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
