import { z } from "zod";

export const departmentSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters.")
    .max(100),
  headEmployeeId: z.string().nullable().optional(),
  parentDepartmentId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createDepartmentSchema = departmentSchema.pick({
  name: true,
  headEmployeeId: true,
  parentDepartmentId: true,
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type Department = z.infer<typeof departmentSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
