import { z } from "zod";

export const assetStatusSchema = z.enum([
  "AVAILABLE",
  "ALLOCATED",
  "RESERVED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
]);

export const assetSchema = z.object({
  id: z.string(),
  assetTag: z
    .string()
    .min(3, "Asset tag must be at least 3 characters.")
    .max(50),
  name: z.string().min(2, "Asset name must be at least 2 characters.").max(150),
  categoryId: z.string().min(1, "Category ID is required."),
  serialNumber: z.string().max(100).nullable().optional(),
  qrCode: z.string().max(255).nullable().optional(),
  acquisitionDate: z.coerce.date().nullable().optional(),
  acquisitionCost: z
    .number()
    .min(0, "Acquisition cost must be positive.")
    .nullable()
    .optional(),
  condition: z.string().max(100).nullable().optional(),
  locationDepartmentId: z.string().nullable().optional(),
  status: assetStatusSchema.default("AVAILABLE"),
  isBookable: z.boolean().default(false),
  photoUrls: z.array(z.string()).default([]),
  documentUrls: z.array(z.string()).default([]),
  categoryMetadata: z.record(z.string(), z.any()).nullable().optional(),
});

export const createAssetSchema = assetSchema.omit({
  id: true,
  status: true,
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: assetStatusSchema.optional(),
});

export type AssetStatus = z.infer<typeof assetStatusSchema>;
export type Asset = z.infer<typeof assetSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
