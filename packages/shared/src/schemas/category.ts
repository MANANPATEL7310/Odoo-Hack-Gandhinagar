import { z } from "zod";

export const fieldTypeSchema = z.enum(["text", "number", "date"]);

export const fieldDefinitionSchema = z.object({
  name: z.string().min(1, "Field name cannot be empty.").max(50),
  type: fieldTypeSchema,
  required: z.boolean().default(false),
});

export const fieldSchemaArray = z.array(fieldDefinitionSchema);

export const assetCategorySchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters.")
    .max(100),
  description: z.string().max(500).nullable().optional(),
  fieldSchema: fieldSchemaArray.nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const createAssetCategorySchema = assetCategorySchema.pick({
  name: true,
  description: true,
  fieldSchema: true,
});

export const updateAssetCategorySchema = createAssetCategorySchema
  .partial()
  .extend({
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  });

export type FieldType = z.infer<typeof fieldTypeSchema>;
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;
export type AssetCategory = z.infer<typeof assetCategorySchema>;
export type CreateAssetCategoryInput = z.infer<
  typeof createAssetCategorySchema
>;
export type UpdateAssetCategoryInput = z.infer<
  typeof updateAssetCategorySchema
>;
