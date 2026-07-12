import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  listTransferRequestsController,
  createTransferRequestController,
  approveTransferRequestController,
  rejectTransferRequestController,
} from "./transfer-requests.controller.js";

export const transferRequestsRouter = createRouter();

transferRequestsRouter.get("/", requireAuth, listTransferRequestsController);
transferRequestsRouter.post("/", requireAuth, createTransferRequestController);
transferRequestsRouter.patch(
  "/:id/approve",
  requireAuth,
  approveTransferRequestController,
);
transferRequestsRouter.patch(
  "/:id/reject",
  requireAuth,
  rejectTransferRequestController,
);
