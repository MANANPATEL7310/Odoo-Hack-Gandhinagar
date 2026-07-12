import { requireAuth } from "../../middleware/require-auth.js";
import { createRouter } from "../../lib/create-router.js";
import { dashboardSummaryController } from "./dashboard.controller.js";

export const dashboardRouter = createRouter();

dashboardRouter.get("/", requireAuth, dashboardSummaryController);
dashboardRouter.get("/summary", requireAuth, dashboardSummaryController);
