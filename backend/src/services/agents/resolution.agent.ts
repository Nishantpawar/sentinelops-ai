import { geminiProvider } from '../ai/gemini.provider';
import { ResolutionAssessmentSchema } from '../../schemas/ai.schema';
import { z } from 'zod';

export type ResolutionAssessment = z.infer<typeof ResolutionAssessmentSchema>;

export class ResolutionAgent {
  static async evaluateResolution(
    incidentTitle: string,
    incidentDescription: string,
    resolutionNotes: string
  ): Promise<ResolutionAssessment> {
    const systemPrompt = `You are SentinelOps AI Resolution Agent.
Summarize technician resolution efforts and assess completeness for supervisor review.
Important: Never claim technical verification; distinguish AI text assessment from human physical verification.`;

    const userPrompt = `Incident Title: ${incidentTitle}
Incident Description: ${incidentDescription}
Technician Resolution Notes: ${resolutionNotes}`;

    const fallback: ResolutionAssessment = {
      isComplete: resolutionNotes.length > 15,
      summary: `Technician reported: "${resolutionNotes}". Initial diagnostics and restorative procedures completed.`,
      missingInformation: resolutionNotes.length <= 15 ? ['Detailed root cause analysis', 'Safety re-check signature'] : [],
      qualityScore: resolutionNotes.length > 15 ? 90 : 60,
      supervisorReviewSummary: `AI Assessment: Resolution notes indicate corrective action was applied. Physical/operational sign-off required by Supervisor.`,
    };

    return await geminiProvider.generateStructuredJSON(
      systemPrompt,
      userPrompt,
      ResolutionAssessmentSchema,
      fallback
    );
  }
}
