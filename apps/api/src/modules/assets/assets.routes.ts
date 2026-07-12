import { createRouter } from "../../lib/create-router.js";
import { validateRequest } from "../../lib/validate-request.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireRoles } from "../../middleware/require-role.js";
import { createAssetSchema, updateAssetSchema } from "@template/shared";
import {
  listAssetsController,
  getAssetByIdController,
  createAssetController,
  updateAssetController,
  retireAssetController,
  disposeAssetController,
} from "./assets.controller.js";

export const assetsRouter = createRouter();

// Get list & detail require authentication (all roles)
assetsRouter.get("/", requireAuth, listAssetsController);
assetsRouter.get("/:id", requireAuth, getAssetByIdController);

// Mutation operations require Admin or Asset Manager roles
assetsRouter.post(
  "/",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  validateRequest(createAssetSchema),
  createAssetController,
);

assetsRouter.put(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  validateRequest(updateAssetSchema),
  updateAssetController,
);

assetsRouter.patch(
  "/:id/retire",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  retireAssetController,
);

assetsRouter.patch(
  "/:id/dispose",
  requireAuth,
  requireRoles("ADMIN", "ASSET_MANAGER"),
  disposeAssetController,
);
