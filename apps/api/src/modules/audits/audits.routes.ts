import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireRoles } from "../../middleware/require-role.js";
import {
  listAuditCyclesController,
  getAuditCycleController,
  createAuditCycleController,
  markAuditItemController,
  closeAuditCycleController,
} from "./audits.controller.js";

export const auditsRouter = createRouter();
export const auditItemsRouter = createRouter();

// Cycles Routes
auditsRouter.get("/", requireAuth, listAuditCyclesController);
auditsRouter.get("/:id", requireAuth, getAuditCycleController);
auditsRouter.post(
  "/",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  createAuditCycleController,
);
auditsRouter.patch(
  "/:id/close",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  closeAuditCycleController,
);

// Items Routes
auditItemsRouter.patch("/:id", requireAuth, markAuditItemController);
