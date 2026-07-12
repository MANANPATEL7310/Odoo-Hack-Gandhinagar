import { createRouter } from "../../lib/create-router.js";
import { publicMetricsController } from "./public-metrics.controller.js";

export const publicMetricsRouter = createRouter();

publicMetricsRouter.get("/", publicMetricsController);
