import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', NotificationController.getMyNotifications);
router.post('/:id/read', NotificationController.markAsRead);

export default router;
