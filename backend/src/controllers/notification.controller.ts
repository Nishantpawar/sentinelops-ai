import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const notifications = await NotificationRepository.findByRecipient(req.user.id);
      res.json({ success: true, data: notifications, message: 'Notifications retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const notification = await NotificationRepository.markAsRead(req.params.id);
      res.json({ success: true, data: notification, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  }
}
