import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireRoles } from "../../middleware/require-role.js";
import {
  listMaintenanceRequestsController,
  createMaintenanceRequestController,
  approveMaintenanceRequestController,
  rejectMaintenanceRequestController,
  assignTechnicianController,
  startMaintenanceController,
  resolveMaintenanceController,
} from "./maintenance.controller.js";

export const maintenanceRouter = createRouter();

maintenanceRouter.get("/", requireAuth, listMaintenanceRequestsController);
maintenanceRouter.post("/", requireAuth, createMaintenanceRequestController);

maintenanceRouter.patch(
  "/:id/approve",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  approveMaintenanceRequestController,
);

maintenanceRouter.patch(
  "/:id/reject",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  rejectMaintenanceRequestController,
);

maintenanceRouter.patch(
  "/:id/assign-technician",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  assignTechnicianController,
);

maintenanceRouter.patch(
  "/:id/start",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  startMaintenanceController,
);

maintenanceRouter.patch(
  "/:id/resolve",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  resolveMaintenanceController,
);
