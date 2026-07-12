import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  listAllocationsController,
  createAllocationController,
  returnAllocationController,
} from "./allocations.controller.js";

export const allocationsRouter = createRouter();

allocationsRouter.get("/", requireAuth, listAllocationsController);
allocationsRouter.post("/", requireAuth, createAllocationController);
allocationsRouter.patch("/:id/return", requireAuth, returnAllocationController);
