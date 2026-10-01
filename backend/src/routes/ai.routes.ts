import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJwt, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/analyze-incident', AIController.analyzeIncident);
router.post('/recommend-assignment', requireRoles('supervisor', 'manager', 'admin'), AIController.recommendAssignment);
router.post('/evaluate-escalation', AIController.evaluateEscalation);
router.post('/communication-decision', AIController.communicationDecision);
router.post('/why-at-risk', AIController.whyAtRisk);

router.get('/recommendations/:incidentId', AIController.getRecommendations);
router.post('/recommendations/:id/approve', requireRoles('supervisor', 'manager', 'admin'), AIController.approveRecommendation);
router.post('/recommendations/:id/reject', requireRoles('supervisor', 'manager', 'admin'), AIController.rejectRecommendation);

router.get('/actions', AIController.getActions);

export default router;
