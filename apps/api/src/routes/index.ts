import { Router, Request, Response } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { uploadRouter } from "../modules/upload/upload.routes.js";
import { notificationRouter } from "../modules/notification/notification.routes.js";
import { requireAuth } from "../middleware/require-auth.js";
import { requireRoles } from "../middleware/require-role.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/notifications", notificationRouter);

// Stub endpoints for the frontend - TO BE IMPLEMENTED BY BACKEND TEAM
const stubHandler = (req: Request, res: Response) => {
  res
    .status(501)
    .json({ success: false, message: "Endpoint not implemented yet" });
};

// Org Setup Module
apiRouter.get("/departments", requireAuth, stubHandler);
apiRouter.post("/departments", requireAuth, requireRoles("ADMIN"), stubHandler);
apiRouter.put(
  "/departments/:id",
  requireAuth,
  requireRoles("ADMIN"),
  stubHandler,
);
apiRouter.patch(
  "/departments/:id/deactivate",
  requireAuth,
  requireRoles("ADMIN"),
  stubHandler,
);

apiRouter.get("/asset-categories", requireAuth, stubHandler);
apiRouter.post(
  "/asset-categories",
  requireAuth,
  requireRoles("ADMIN"),
  stubHandler,
);
apiRouter.put(
  "/asset-categories/:id",
  requireAuth,
  requireRoles("ADMIN"),
  stubHandler,
);
apiRouter.delete(
  "/asset-categories/:id",
  requireAuth,
  requireRoles("ADMIN"),
  stubHandler,
);

apiRouter.get("/employees", requireAuth, stubHandler);
apiRouter.patch(
  "/employees/:id/role",
  requireAuth,
  requireRoles("ADMIN"),
  stubHandler,
);
apiRouter.patch(
  "/employees/:id/status",
  requireAuth,
  requireRoles("ADMIN"),
  stubHandler,
);

// Asset Registry Module
apiRouter.get("/assets", requireAuth, stubHandler);
apiRouter.get("/assets/:id", requireAuth, stubHandler);
apiRouter.post(
  "/assets",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.put(
  "/assets/:id",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.patch(
  "/assets/:id/retire",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.patch(
  "/assets/:id/dispose",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);

// Allocation Module
apiRouter.post("/allocations", requireAuth, stubHandler);
apiRouter.patch("/allocations/:id/return", requireAuth, stubHandler);
apiRouter.post("/transfer-requests", requireAuth, stubHandler);
apiRouter.patch(
  "/transfer-requests/:id/approve",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  stubHandler,
);
apiRouter.patch(
  "/transfer-requests/:id/reject",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  stubHandler,
);

// Booking Module
apiRouter.get("/bookings", requireAuth, stubHandler);
apiRouter.post("/bookings", requireAuth, stubHandler);
apiRouter.patch("/bookings/:id/cancel", requireAuth, stubHandler);
apiRouter.patch("/bookings/:id/reschedule", requireAuth, stubHandler);

// Maintenance Module
apiRouter.post("/maintenance-requests", requireAuth, stubHandler);
apiRouter.patch(
  "/maintenance-requests/:id/approve",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.patch(
  "/maintenance-requests/:id/reject",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.patch(
  "/maintenance-requests/:id/assign-technician",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.patch(
  "/maintenance-requests/:id/start",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.patch(
  "/maintenance-requests/:id/resolve",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);

// Audit Module
apiRouter.post(
  "/audit-cycles",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);
apiRouter.patch("/audit-cycle-items/:id", requireAuth, stubHandler);
apiRouter.patch(
  "/audit-cycles/:id/close",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  stubHandler,
);

// Reports Module
apiRouter.get("/reports/utilization", requireAuth, stubHandler);
apiRouter.get("/reports/maintenance-frequency", requireAuth, stubHandler);
apiRouter.get("/reports/retirement-forecast", requireAuth, stubHandler);
apiRouter.get(
  "/reports/department-allocation-summary",
  requireAuth,
  stubHandler,
);
apiRouter.get("/reports/booking-heatmap", requireAuth, stubHandler);
apiRouter.get("/reports/:reportType/export", requireAuth, stubHandler);

// Activity Logs
apiRouter.get("/activity-logs", requireAuth, stubHandler);
