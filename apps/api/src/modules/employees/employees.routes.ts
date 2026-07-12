import { createRouter } from "../../lib/create-router.js";
import { validateRequest } from "../../lib/validate-request.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireRoles } from "../../middleware/require-role.js";
import {
  updateRoleInputSchema,
  updateStatusInputSchema,
  assignDepartmentInputSchema,
} from "./employees.schema.js";
import {
  listEmployeesController,
  updateEmployeeRoleController,
  updateEmployeeStatusController,
  assignEmployeeDepartmentController,
} from "./employees.controller.js";

export const employeesRouter = createRouter();

// Both Admin and Department Head can query (permissions scoped inside service)
employeesRouter.get("/", requireAuth, listEmployeesController);

employeesRouter.patch(
  "/:id/role",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(updateRoleInputSchema),
  updateEmployeeRoleController,
);

employeesRouter.patch(
  "/:id/status",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(updateStatusInputSchema),
  updateEmployeeStatusController,
);

employeesRouter.patch(
  "/:id/department",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(assignDepartmentInputSchema),
  assignEmployeeDepartmentController,
);
