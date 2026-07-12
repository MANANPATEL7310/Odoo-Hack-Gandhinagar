import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  listNotificationsController,
  readNotificationController,
} from "./notification.controller.js";

export const notificationRouter = createRouter();

notificationRouter.get("/", requireAuth, listNotificationsController);
notificationRouter.patch("/:id/read", requireAuth, readNotificationController);
