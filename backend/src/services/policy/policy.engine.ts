import { config } from '../../config/env';
import { UserRole } from '../../types';

export interface PolicyCheckResult {
  allowed: boolean;
  requiresHumanApproval: boolean;
  reason: string;
}

export class PolicyEngine {
  private static allowedAiActions = [
    'CREATE_RECOMMENDATION',
    'NOTIFY_SUPERVISOR',
    'REMIND_TECHNICIAN',
    'ESCALATE_INCIDENT',
    'GENERATE_SUMMARY',
    'CLASSIFY_INCIDENT',
  ];

  static evaluateAiAction(
    actionType: string,
    userRole?: UserRole
  ): PolicyCheckResult {
    // 1. Action allowlist check
    if (!this.allowedAiActions.includes(actionType)) {
      return {
        allowed: false,
        requiresHumanApproval: true,
        reason: `Action '${actionType}' is not in the system AI action allowlist.`,
      };
    }

    // 2. High-impact operations ALWAYS require human approval regardless of autonomy level
    if (['REASSIGN_TECHNICIAN', 'CLOSE_INCIDENT', 'CHANGE_USER_ROLE', 'DELETE_INCIDENT'].includes(actionType)) {
      return {
        allowed: true,
        requiresHumanApproval: true,
        reason: `High-risk action '${actionType}' strictly requires supervisor/manager approval.`,
      };
    }

    // 3. Autonomy Level check
    const autonomyLevel = config.aiAutonomyLevel; // 1: Advisory, 2: Assisted, 3: Controlled Autonomous

    if (autonomyLevel === 1) {
      return {
        allowed: true,
        requiresHumanApproval: true,
        reason: 'System set to Level 1 (Advisory). Human approval required for all actions.',
      };
    }

    if (autonomyLevel === 2) {
      // Level 2: Allow notifications and recommendations automatically, require approval for assignments/escalations
      if (['NOTIFY_SUPERVISOR', 'REMIND_TECHNICIAN', 'GENERATE_SUMMARY', 'CLASSIFY_INCIDENT', 'CREATE_RECOMMENDATION'].includes(actionType)) {
        return {
          allowed: true,
          requiresHumanApproval: false,
          reason: 'Level 2 Assisted: Safe informational/coordination action permitted automatically.',
        };
      }
      return {
        allowed: true,
        requiresHumanApproval: true,
        reason: 'Level 2 Assisted: Action requires human verification.',
      };
    }

    // Level 3 Controlled Autonomous
    return {
      allowed: true,
      requiresHumanApproval: false,
      reason: 'Level 3 Autonomous: Predefined safe operational action executed.',
    };
  }

  static checkUserPermission(
    role: UserRole,
    action: 'CREATE' | 'ASSIGN' | 'UPDATE' | 'RESOLVE' | 'APPROVE' | 'ADMIN'
  ): boolean {
    switch (action) {
      case 'CREATE':
        return ['operator', 'supervisor', 'manager', 'admin'].includes(role);
      case 'ASSIGN':
        return ['supervisor', 'manager', 'admin'].includes(role);
      case 'UPDATE':
        return ['operator', 'supervisor', 'technician', 'manager', 'admin'].includes(role);
      case 'RESOLVE':
        return ['technician', 'supervisor', 'manager', 'admin'].includes(role);
      case 'APPROVE':
        return ['supervisor', 'manager', 'admin'].includes(role);
      case 'ADMIN':
        return role === 'admin';
      default:
        return false;
    }
  }
}
