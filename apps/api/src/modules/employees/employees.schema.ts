import { z } from "zod";
import { Role } from "@prisma/client";

export const updateRoleInputSchema = z.object({
  role: z.enum([Role.EMPLOYEE, Role.DEPARTMENT_HEAD, Role.ASSET_MANAGER], {
    message: "Role must be one of EMPLOYEE, DEPARTMENT_HEAD, or ASSET_MANAGER.",
  }),
});

export const updateStatusInputSchema = z.object({
  status: z.enum(["Active", "Inactive", "ACTIVE", "INACTIVE"], {
    message: "Status must be Active or Inactive.",
  }),
});

export const assignDepartmentInputSchema = z.object({
  departmentId: z.string().nullable().optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusInputSchema>;
export type AssignDepartmentInput = z.infer<typeof assignDepartmentInputSchema>;
