import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireRoles } from "../../middleware/require-role.js";
import {
  getUtilizationReportController,
  getMaintenanceFrequencyReportController,
  getRetirementForecastReportController,
  getDepartmentAllocationReportController,
  getBookingHeatmapReportController,
  exportReportController,
} from "./reports.controller.js";

export const reportsRouter = createRouter();

// Gate reports to Admin, Asset Manager, and Department Head only
reportsRouter.use(
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
);

reportsRouter.get("/utilization", getUtilizationReportController);
reportsRouter.get(
  "/maintenance-frequency",
  // Let's import the correct name
  getMaintenanceFrequencyReportController,
);
reportsRouter.get(
  "/retirement-forecast",
  getRetirementForecastReportController,
);
reportsRouter.get(
  "/department-allocation-summary",
  getDepartmentAllocationReportController,
);
reportsRouter.get("/booking-heatmap", getBookingHeatmapReportController);
reportsRouter.get("/:reportType/export", exportReportController);
