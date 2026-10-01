import { geminiProvider } from '../ai/gemini.provider';
import { CommunicationDecisionSchema } from '../../schemas/ai.schema';
import { StructuredAiCommunicationDecision } from '../../types';
import { AgentContextBuilder } from '../ai/context.builder';
import { UserRepository } from '../../repositories/user.repository';

export class CommunicationAgent {
  static async decide(
    incidentId: string,
    eventTrigger: 'UNASSIGNED_URGENT' | 'SLA_WARNING' | 'ASSIGNED' | 'RESOLVED' | 'ESCALATED'
  ): Promise<StructuredAiCommunicationDecision> {
    const context = await AgentContextBuilder.buildIncidentContext(incidentId);
    const supervisors = await UserRepository.findByRole('supervisor');
    const targetSupervisor = supervisors[0];

    const systemPrompt = `You are SentinelOps AI Communication Agent.
Your responsibility is to decide whether notifications are necessary, who should receive them, in which language (en, hi, mr), and write clear operational messages.

RULES:
- Do NOT spam unnecessary messages.
- Always provide clear, actionable information.
- Match recipient language preference.`;

    const userPrompt = `Event Trigger: ${eventTrigger}
Incident Title: ${context.incident.title}
Incident Severity: ${context.incident.severity}
Status: ${context.incident.status}
Original Language: ${context.incident.original_language}`;

    let subject = `[SentinelOps Alert] Action required for ${context.incident.incident_number}`;
    let message = `Incident "${context.incident.title}" requires operational review.`;
    let language: 'en' | 'hi' | 'mr' = context.incident.original_language || 'en';

    if (eventTrigger === 'UNASSIGNED_URGENT') {
      if (language === 'mr') {
        subject = `[गंभीर सूचना] घटना ${context.incident.incident_number} साठी मालक आवश्यक आहे`;
        message = `घटना "${context.incident.title}" अद्याप कोणत्याही तंत्रज्ञाला दिलेली नाही. कृपया त्वरित तंत्रज्ञ नियुक्त करा.`;
      } else if (language === 'hi') {
        subject = `[गंभीर चेतावनी] घटना ${context.incident.incident_number} के लिए मालिक आवश्यक है`;
        message = `घटना "${context.incident.title}" अभी तक किसी भी तकनीशियन को आवंटित नहीं की गई है। कृपया तुरंत कार्रवाई करें।`;
      } else {
        subject = `[CRITICAL ALERT] Owner Required for ${context.incident.incident_number}`;
        message = `Urgent incident "${context.incident.title}" has no assigned owner. Immediate supervisor action is required.`;
      }
    }

    const fallback: StructuredAiCommunicationDecision = {
      shouldNotify: true,
      urgency: context.incident.severity,
      recipients: targetSupervisor
        ? [{ userId: targetSupervisor.id, role: 'supervisor', name: targetSupervisor.name }]
        : [],
      channel: 'in_app',
      language,
      subject,
      message,
      reason: `Operational trigger (${eventTrigger}) requires key stakeholder notification to prevent SLA breach.`,
    };

    const res = await geminiProvider.generateStructuredJSON(
      systemPrompt,
      userPrompt,
      CommunicationDecisionSchema,
      fallback
    );

    return res as unknown as StructuredAiCommunicationDecision;
  }
}
