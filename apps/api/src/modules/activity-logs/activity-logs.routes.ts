import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { listActivityLogsController } from "./activity-logs.controller.js";

export const activityLogsRouter = createRouter();

activityLogsRouter.get("/", requireAuth, listActivityLogsController);
