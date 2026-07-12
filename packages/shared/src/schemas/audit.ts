import { z } from "zod";

export const auditStatusSchema = z.enum(["OPEN", "CLOSED"]);

export const auditItemStatusSchema = z.enum([
  "UNVERIFIED",
  "VERIFIED",
  "MISSING",
  "DAMAGED",
  "UNRESOLVED",
]);

export const auditCycleSchema = z.object({
  id: z.string(),
  scopeDepartmentId: z.string().nullable().optional(),
  scopeLocation: z.string().nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: auditStatusSchema.default("OPEN"),
  createdByEmployeeId: z.string(),
  closedAt: z.coerce.date().nullable().optional(),
});

export const createAuditCycleSchema = auditCycleSchema
  .pick({
    scopeDepartmentId: true,
    scopeLocation: true,
    startDate: true,
    endDate: true,
  })
  .extend({
    auditorEmployeeIds: z
      .array(z.string())
      .min(1, "At least one auditor must be assigned."),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

export const markAuditItemSchema = z.object({
  status: auditItemStatusSchema,
  notes: z.string().max(500).nullable().optional(),
});

export type AuditStatus = z.infer<typeof auditStatusSchema>;
export type AuditItemStatus = z.infer<typeof auditItemStatusSchema>;
export type AuditCycle = z.infer<typeof auditCycleSchema>;
export type CreateAuditCycleInput = z.infer<typeof createAuditCycleSchema>;
export type MarkAuditItemInput = z.infer<typeof markAuditItemSchema>;
