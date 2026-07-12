import { createRouter } from "../../lib/create-router.js";
import { validateRequest } from "../../lib/validate-request.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireRoles } from "../../middleware/require-role.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "@template/shared";
import {
  listDepartmentsController,
  createDepartmentController,
  updateDepartmentController,
  deactivateDepartmentController,
} from "./departments.controller.js";

export const departmentsRouter = createRouter();

departmentsRouter.get("/", requireAuth, listDepartmentsController);

departmentsRouter.post(
  "/",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(createDepartmentSchema),
  createDepartmentController,
);

departmentsRouter.put(
  "/:id",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(updateDepartmentSchema),
  updateDepartmentController,
);

departmentsRouter.patch(
  "/:id/deactivate",
  requireAuth,
  requireRoles("ADMIN"),
  deactivateDepartmentController,
);
