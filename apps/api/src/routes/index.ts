import { Router } from "express";
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


