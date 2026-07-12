import { db } from "../../lib/db.js";

export class NotificationService {
  async create(
    recipientId: string,
    type: string,
    message: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
  ) {
    return db.notification.create({
      data: {
        recipientEmployeeId: recipientId,
        type,
        message,
        relatedEntityType,
        relatedEntityId,
      },
    });
  }

  async list(recipientId: string, isRead?: boolean) {
    return db.notification.findMany({
      where: {
        recipientEmployeeId: recipientId,
        ...(isRead !== undefined ? { isRead } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async markAsRead(id: string, recipientId: string) {
    return db.notification.updateMany({
      where: {
        id,
        recipientEmployeeId: recipientId,
      },
      data: {
        isRead: true,
      },
    });
  }
}

export const notificationService = new NotificationService();
