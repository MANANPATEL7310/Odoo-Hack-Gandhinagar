import type { Request, Response } from "express";
import { sendOk, sendError } from "../../lib/response.js";
import { notificationService } from "../../services/notification/notification.service.js";

export async function listNotificationsController(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return sendError(res, 401, "Unauthorized: User session is missing.");
    }

    const isReadParam = req.query.isRead;
    const isRead =
      isReadParam === "true"
        ? true
        : isReadParam === "false"
          ? false
          : undefined;

    const notifications = await notificationService.list(userId, isRead);
    return sendOk(res, notifications);
  } catch (error) {
    console.error("List notifications error:", error);
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Failed to fetch notifications.",
    );
  }
}

export async function readNotificationController(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return sendError(res, 401, "Unauthorized: User session is missing.");
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return sendError(res, 400, "Bad Request: Notification ID is missing or invalid.");
    }

    const result = await notificationService.markAsRead(id, userId);
    if (result.count === 0) {
      return sendError(
        res,
        404,
        "Notification not found or access is forbidden.",
      );
    }

    return sendOk(res, null, "Notification marked as read successfully.");
  } catch (error) {
    console.error("Read notification error:", error);
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Failed to mark notification as read.",
    );
  }
}
