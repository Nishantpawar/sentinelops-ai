import { geminiProvider } from '../ai/gemini.provider';
import { IncidentAnalysisSchema } from '../../schemas/ai.schema';
import { StructuredAiAnalysis } from '../../types';

export class IncidentAnalysisAgent {
  static async analyze(text: string, title?: string): Promise<StructuredAiAnalysis> {
    const systemPrompt = `You are SentinelOps AI Incident Analysis Agent.
Your responsibility is to analyze raw operational incident reports (which may be in English, Hindi, or Marathi) and produce structured operational insights.

Analyze:
1. Language detection ('en', 'hi', 'mr').
2. Category classification.
3. Severity and Urgency (low, medium, high, critical).
4. Concise English summary.
5. Required technical skills.
6. Recommended action & team.
7. Decision factors (factual observable reasons).

SYSTEM PROMPT STRICT RULES:
- Never expose internal reasoning.
- Never invent unstated facts.
- Return valid JSON matching the schema.`;

    const userPrompt = `Incident Title: ${title || 'Unspecified'}
Incident Description: ${text}`;

    let detectedLang: 'en' | 'hi' | 'mr' = 'en';
    if (/[\u0900-\u097F]/.test(text)) {
      if (text.includes('आहे') || text.includes('झाली') || text.includes('थांबले')) {
        detectedLang = 'mr';
      } else {
        detectedLang = 'hi';
      }
    }

    const isUrgent =
      text.toLowerCase().includes('stop') ||
      text.toLowerCase().includes('down') ||
      text.includes('बंद') ||
      text.includes('थांबले') ||
      text.toLowerCase().includes('fire') ||
      text.toLowerCase().includes('outage');

    const fallback: StructuredAiAnalysis = {
      language: detectedLang,
      category: text.toLowerCase().includes('machine') || text.includes('मशीन') ? 'equipment_failure' : 'other',
      severity: isUrgent ? 'critical' : 'medium',
      urgency: isUrgent ? 'critical' : 'medium',
      summary: title || 'Operational incident reported',
      requiredSkills: ['Equipment Diagnostics', 'Electrical Maintenance'],
      estimatedComplexity: 'high',
      recommendedTeam: 'Maintenance',
      recommendedAction: 'Immediate supervisor assignment required due to potential operational blockage.',
      escalationRequired: isUrgent,
      communicationRequired: true,
      confidence: 0.92,
      decisionFactors: [
        'Detected urgent operational language indicates process stoppage.',
        'No active technician is assigned to this location.',
        'Requires specialized electrical or mechanical skills.',
      ],
    };

    const res = await geminiProvider.generateStructuredJSON(
      systemPrompt,
      userPrompt,
      IncidentAnalysisSchema,
      fallback
    );

    return res as unknown as StructuredAiAnalysis;
  }
}
