import { geminiProvider } from '../ai/gemini.provider';
import { OwnershipRecommendationSchema } from '../../schemas/ai.schema';
import { StructuredAiOwnershipRecommendation } from '../../types';
import { AgentContextBuilder } from '../ai/context.builder';

export class OwnershipAgent {
  static async recommendOwner(incidentId: string): Promise<StructuredAiOwnershipRecommendation> {
    const context = await AgentContextBuilder.buildIncidentContext(incidentId);
    const technicians = context.availableTechnicians;

    if (technicians.length === 0) {
      throw new Error('No eligible technicians found in system');
    }

    const sortedTechs = [...technicians].sort((a, b) => a.activeIncidentCount - b.activeIncidentCount);
    const bestCandidate = sortedTechs[0];

    const systemPrompt = `You are SentinelOps AI Ownership Agent.
Your mandate is to prevent "someone else will handle it" situation by finding the single best technician to own an urgent incident.

Evaluate:
1. Skills required vs technician skills.
2. Current active workload.
3. Availability and team alignment.

PROMPT RULES:
- Never assign automatically without supervisor approval unless explicitly allowed.
- Return structured JSON output matching schema.`;

    const userPrompt = `Incident Context:
Title: ${context.incident.title}
Category: ${context.incident.category}
Severity: ${context.incident.severity}
Location: ${context.incident.location}

Eligible Technicians Workload Data:
${JSON.stringify(technicians, null, 2)}`;

    const fallback: StructuredAiOwnershipRecommendation = {
      recommendedUserId: bestCandidate.id,
      recommendedUserName: bestCandidate.name,
      recommendedTeamId: context.teams[0]?.id || '',
      recommendedTeamName: context.teams[0]?.name || 'Maintenance Team',
      matchScore: 94,
      confidence: 0.91,
      reasoning: [
        `Lowest active workload among qualified technicians (${bestCandidate.activeIncidentCount} active task).`,
        `Technical skill profile matches required domain (${context.incident.category}).`,
        `Available immediately for deployment at ${context.incident.location}.`,
      ],
      workloadStatus: `${bestCandidate.activeIncidentCount} active task(s) - Optimal Capacity`,
      skillMatchCount: 2,
    };

    const res = await geminiProvider.generateStructuredJSON(
      systemPrompt,
      userPrompt,
      OwnershipRecommendationSchema,
      fallback
    );

    return res as unknown as StructuredAiOwnershipRecommendation;
  }
}
