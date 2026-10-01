import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Send } from 'lucide-react';
import { incidentService } from '../../services/incident.service';
import { aiService } from '../../services/ai.service';
import { PreferredLanguage } from '../../types';

export const IncidentCreateModal: React.FC<{ onClose: () => void; onCreated?: () => void }> = ({
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Factory Floor Line 2');
  const [language, setLanguage] = useState<PreferredLanguage>('en');
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);

  const handleAiAnalyze = async () => {
    if (!description) return;
    setAnalyzing(true);
    try {
      const data = await aiService.analyzeIncident(description, title);
      setAiPreview(data);
      if (data.language) setLanguage(data.language);
    } catch (err) {
      console.error('AI preview failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      await incidentService.create({
        title,
        description,
        location,
        original_language: language,
        category: aiPreview?.category || 'other',
        severity: aiPreview?.severity || 'medium',
        priority: aiPreview?.urgency || 'medium',
      });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      alert('Failed to create incident: ' + (err as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Report Operational Incident</h2>
              <p className="text-xs text-slate-400">
                Natural language descriptions in English, Hindi, or Marathi are automatically classified by AI.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production Conveyor Motor Tripped"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Incident Description (Multilingual Natural Language)
              </label>
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={analyzing || !description}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{analyzing ? 'Analyzing with AI...' : 'Preview AI Analysis'}</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter details in English, Hindi (उदा. मशीन अचानक बंद पड़ गई है) or Marathi (उदा. मशीन अचानक बंद झाली आहे आणि उत्पादन थांबले आहे)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Zone</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Language Detected/Preferred</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as PreferredLanguage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="en">English (en)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {/* AI Analysis Preview Card */}
          {aiPreview && (
            <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-blue-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Classification Preview
                </span>
                <span>Confidence: {Math.round(aiPreview.confidence * 100)}%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Category:</span> {aiPreview.category}
                </div>
                <div>
                  <span className="text-slate-500 block">Severity:</span> {aiPreview.severity}
                </div>
                <div>
                  <span className="text-slate-500 block">Urgency:</span> {aiPreview.urgency}
                </div>
                <div>
                  <span className="text-slate-500 block">Team:</span> {aiPreview.recommendedTeam}
                </div>
              </div>
              <p className="text-slate-300 pt-1 border-t border-blue-500/20">
                <strong className="text-blue-300">AI Summary:</strong> {aiPreview.summary}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white font-medium hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
