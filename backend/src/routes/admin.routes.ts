import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJwt, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);
router.use(requireRoles('admin'));

router.get('/users', AdminController.getUsers);
router.get('/teams', AdminController.getTeams);
router.get('/sla', AdminController.getSlaPolicies);
router.patch('/sla/:id', AdminController.updateSlaPolicy);

export default router;
