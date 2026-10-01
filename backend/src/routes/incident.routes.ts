import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authenticateJwt, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', IncidentController.getAll);
router.post('/', requireRoles('operator', 'supervisor', 'manager', 'admin'), IncidentController.create);
router.get('/:id', IncidentController.getById);
router.post('/:id/assign', requireRoles('supervisor', 'manager', 'admin'), IncidentController.assign);
router.patch('/:id/status', IncidentController.updateStatus);

router.get('/:id/assignments', IncidentController.getAssignments);
router.get('/:id/updates', IncidentController.getUpdates);
router.post('/:id/updates', IncidentController.postUpdate);

router.get('/:id/messages', IncidentController.getMessages);
router.post('/:id/messages', IncidentController.postMessage);

export default router;
