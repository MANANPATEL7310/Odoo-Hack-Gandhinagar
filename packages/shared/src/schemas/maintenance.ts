import { z } from "zod";

export const maintenancePrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const maintenanceStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "TECHNICIAN_ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
]);

export const maintenanceRequestSchema = z.object({
  id: z.string(),
  assetId: z.string().min(1, "Asset ID is required."),
  raisedByEmployeeId: z.string(),
  issueDescription: z
    .string()
    .min(5, "Issue description must be at least 5 characters.")
    .max(1000),
  priority: maintenancePrioritySchema.default("MEDIUM"),
  photoUrl: z.string().nullable().optional(),
  status: maintenanceStatusSchema.default("PENDING"),
  decidedByEmployeeId: z.string().nullable().optional(),
  decidedAt: z.coerce.date().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  technicianEmployeeId: z.string().nullable().optional(),
  resolvedAt: z.coerce.date().nullable().optional(),
});

export const createMaintenanceRequestSchema = maintenanceRequestSchema.pick({
  assetId: true,
  issueDescription: true,
  priority: true,
  photoUrl: true,
});

export const approveMaintenanceRequestSchema = z.object({
  technicianEmployeeId: z
    .string()
    .min(1, "Technician employee ID is required."),
});

export const rejectMaintenanceRequestSchema = z.object({
  rejectionReason: z
    .string()
    .min(3, "Rejection reason must be at least 3 characters.")
    .max(500),
});

export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>;
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;
export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema>;
export type CreateMaintenanceRequestInput = z.infer<
  typeof createMaintenanceRequestSchema
>;
export type ApproveMaintenanceRequestInput = z.infer<
  typeof approveMaintenanceRequestSchema
>;
export type RejectMaintenanceRequestInput = z.infer<
  typeof rejectMaintenanceRequestSchema
>;
