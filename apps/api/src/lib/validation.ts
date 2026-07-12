import { z } from "zod";
import { db } from "./db.js";
import type { FieldDefinition } from "@template/shared";

/**
 * Validates that setting parentId as the parent of departmentId will not create a circular dependency.
 * Returns true if the relationship is acyclic (valid), and false if it would create a cycle.
 */
export async function validateAcyclicHierarchy(
  departmentId: string,
  parentId: string | null | undefined,
): Promise<boolean> {
  if (!parentId) return true;
  if (departmentId === parentId) return false;

  let currentParentId: string | null | undefined = parentId;
  let depth = 0;
  const maxDepth = 50; // Prevention against malicious loops or deep stacks

  while (currentParentId && depth < maxDepth) {
    if (currentParentId === departmentId) {
      return false; // Loop detected: parentId is a descendant of departmentId
    }

    const parentDept: { parentDepartmentId: string | null } | null =
      await db.department.findUnique({
        where: { id: currentParentId },
        select: { parentDepartmentId: true },
      });

    if (!parentDept) break;
    currentParentId = parentDept.parentDepartmentId;
    depth++;
  }

  return true;
}

/**
 * Validates dynamic categoryMetadata against a category's configured fieldSchema.
 * Dynamically builds a Zod validator and returns { success: boolean, error?: string }.
 */
export function validateCategoryMetadata(
  metadata: unknown,
  fieldSchema: unknown,
): { success: boolean; error?: string } {
  if (!fieldSchema) return { success: true };

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { success: false, error: "Metadata must be a key-value object." };
  }

  const schemaArray = fieldSchema as FieldDefinition[];
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of schemaArray) {
    let fieldType: z.ZodTypeAny;

    if (field.type === "number") {
      fieldType = z.coerce.number({
        message: `${field.name} must be a number.`,
      });
    } else if (field.type === "date") {
      fieldType = z.coerce.date({
        message: `${field.name} must be a valid date.`,
      });
    } else {
      fieldType = z.string().max(500);
    }

    if (!field.required) {
      fieldType = fieldType.optional().nullable();
    }

    shape[field.name] = fieldType;
  }

  const dynamicSchema = z.object(shape);
  const result = dynamicSchema.safeParse(metadata);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMsg = Object.entries(errors)
      .map(([field, errs]) => `${field}: ${errs?.join(", ")}`)
      .join("; ");
    return { success: false, error: errorMsg };
  }

  return { success: true };
}
