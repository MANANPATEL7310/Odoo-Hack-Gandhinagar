import { Router, Request, Response } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { uploadRouter } from "../modules/upload/upload.routes.js";
import { notificationRouter } from "../modules/notification/notification.routes.js";

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

// Assets & Categories
apiRouter.get("/assets", stubHandler);
apiRouter.post("/assets", stubHandler);
apiRouter.get("/asset-categories", stubHandler);

// Organization Setup
apiRouter.get("/departments", stubHandler);
apiRouter.get("/employees", stubHandler);

// Allocations
apiRouter.get("/allocations", stubHandler);
apiRouter.post("/allocations", stubHandler);

// Bookings
apiRouter.get("/bookings", stubHandler);
apiRouter.post("/bookings", stubHandler);

// Maintenance
apiRouter.get("/maintenance", stubHandler);
apiRouter.post("/maintenance", stubHandler);

// Audits
apiRouter.get("/audits", stubHandler);
apiRouter.post("/audits", stubHandler);
