import { db } from '../config/database';
import { Notification } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationRepository {
  static async findByRecipient(recipientId: string): Promise<Notification[]> {
    return db.tables.notifications
      .filter((n) => n.recipient_id === recipientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async create(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const recipient = db.tables.users.find((u) => u.id === notificationData.recipient_id);
    const newNotif: Notification = {
      id: uuidv4(),
      ...notificationData,
      recipient_name: recipient ? recipient.name : undefined,
      created_at: new Date().toISOString(),
    };
    db.tables.notifications.push(newNotif);
    return newNotif;
  }

  static async markAsRead(id: string): Promise<Notification | null> {
    const notif = db.tables.notifications.find((n) => n.id === id);
    if (!notif) return null;
    notif.status = 'read';
    return notif;
  }

  static async findRecentDuplicate(
    recipientId: string,
    incidentId: string | undefined | null,
    type: string,
    cooldownMinutes: number
  ): Promise<Notification | null> {
    const cutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000);
    const match = db.tables.notifications.find((n) => {
      return (
        n.recipient_id === recipientId &&
        n.incident_id === (incidentId || null) &&
        n.type === type &&
        new Date(n.created_at) >= cutoff
      );
    });
    return match || null;
  }
}
