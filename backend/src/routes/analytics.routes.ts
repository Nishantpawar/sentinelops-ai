import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJwt, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/overview', AnalyticsController.getOverview);
router.get('/sla', AnalyticsController.getSlaMetrics);
router.get('/workload', AnalyticsController.getWorkloadMetrics);
router.get('/ai', AnalyticsController.getAiMetrics);
router.get('/audit', requireRoles('manager', 'admin', 'supervisor'), AnalyticsController.getAuditLogs);

export default router;
