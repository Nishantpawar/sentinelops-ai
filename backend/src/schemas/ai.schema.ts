import { z } from 'zod';

export const IncidentAnalysisSchema = z.object({
  language: z.enum(['en', 'hi', 'mr']).default('en'),
  category: z.enum([
    'equipment_failure',
    'network_issue',
    'software_issue',
    'electrical_issue',
    'security_alert',
    'facility_issue',
    'production_issue',
    'safety_issue',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  summary: z.string(),
  requiredSkills: z.array(z.string()),
  estimatedComplexity: z.enum(['low', 'medium', 'high']),
  recommendedTeam: z.string().nullable(),
  recommendedAction: z.string(),
  escalationRequired: z.boolean(),
  communicationRequired: z.boolean(),
  confidence: z.number().min(0).max(1),
  decisionFactors: z.array(z.string()),
});

export const OwnershipRecommendationSchema = z.object({
  recommendedUserId: z.string(),
  recommendedUserName: z.string(),
  recommendedTeamId: z.string(),
  recommendedTeamName: z.string(),
  matchScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string()),
  workloadStatus: z.string(),
  skillMatchCount: z.number().min(0),
});

export const CommunicationDecisionSchema = z.object({
  shouldNotify: z.boolean(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  recipients: z.array(
    z.object({
      userId: z.string(),
      role: z.enum(['operator', 'supervisor', 'technician', 'manager', 'admin']),
      name: z.string(),
    })
  ),
  channel: z.enum(['in_app', 'email', 'internal_msg']),
  language: z.enum(['en', 'hi', 'mr']),
  subject: z.string(),
  message: z.string(),
  reason: z.string(),
});

export const EscalationDecisionSchema = z.object({
  shouldEscalate: z.boolean(),
  escalationLevel: z.enum(['REMINDER', 'SUPERVISOR_ALERT', 'MANAGER_ESCALATION']),
  reason: z.string(),
  suggestedAction: z.string(),
  confidence: z.number().min(0).max(1),
});

export const ResolutionAssessmentSchema = z.object({
  isComplete: z.boolean(),
  summary: z.string(),
  missingInformation: z.array(z.string()),
  qualityScore: z.number().min(0).max(100),
  supervisorReviewSummary: z.string(),
});
