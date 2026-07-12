import { z } from "zod";

export const allocationStatusSchema = z.enum(["ACTIVE", "RETURNED"]);

export const allocationSchema = z.object({
  id: z.string(),
  assetId: z.string().min(1, "Asset ID is required."),
  holderEmployeeId: z.string().nullable().optional(),
  holderDepartmentId: z.string().nullable().optional(),
  allocatedAt: z.coerce.date().optional(),
  expectedReturnDate: z.coerce.date().nullable().optional(),
  returnedAt: z.coerce.date().nullable().optional(),
  conditionAtReturn: z.string().nullable().optional(),
  status: allocationStatusSchema.default("ACTIVE"),
});

export const allocateAssetSchema = allocationSchema
  .pick({
    assetId: true,
    holderEmployeeId: true,
    holderDepartmentId: true,
    expectedReturnDate: true,
  })
  .refine((data) => data.holderEmployeeId || data.holderDepartmentId, {
    message:
      "Allocation must have either a holder employee or a holder department.",
    path: ["holderEmployeeId"],
  });

export const returnAssetSchema = z.object({
  conditionAtReturn: z
    .string()
    .min(1, "Condition at return is required.")
    .max(200),
});

export const transferAssetSchema = z
  .object({
    targetEmployeeId: z.string().nullable().optional(),
    targetDepartmentId: z.string().nullable().optional(),
    reason: z.string().max(500).nullable().optional(),
  })
  .refine((data) => data.targetEmployeeId || data.targetDepartmentId, {
    message:
      "Transfer must specify either a target employee or a target department.",
    path: ["targetEmployeeId"],
  });

export type AllocationStatus = z.infer<typeof allocationStatusSchema>;
export type Allocation = z.infer<typeof allocationSchema>;
export type AllocateAssetInput = z.infer<typeof allocateAssetSchema>;
export type ReturnAssetInput = z.infer<typeof returnAssetSchema>;
export type TransferAssetInput = z.infer<typeof transferAssetSchema>;
