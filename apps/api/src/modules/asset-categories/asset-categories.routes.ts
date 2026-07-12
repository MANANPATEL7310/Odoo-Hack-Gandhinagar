import { createRouter } from "../../lib/create-router.js";
import { validateRequest } from "../../lib/validate-request.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireRoles } from "../../middleware/require-role.js";
import {
  createAssetCategorySchema,
  updateAssetCategorySchema,
} from "@template/shared";
import {
  listCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "./asset-categories.controller.js";

export const assetCategoriesRouter = createRouter();

assetCategoriesRouter.get("/", requireAuth, listCategoriesController);

assetCategoriesRouter.post(
  "/",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(createAssetCategorySchema),
  createCategoryController,
);

assetCategoriesRouter.put(
  "/:id",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(updateAssetCategorySchema),
  updateCategoryController,
);

assetCategoriesRouter.delete(
  "/:id",
  requireAuth,
  requireRoles("ADMIN"),
  deleteCategoryController,
);
