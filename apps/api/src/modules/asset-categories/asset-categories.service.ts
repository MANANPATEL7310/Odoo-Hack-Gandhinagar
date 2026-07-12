import { db } from "../../lib/db.js";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../../lib/errors.js";
import type {
  CreateAssetCategoryInput,
  UpdateAssetCategoryInput,
} from "@template/shared";
import { CategoryStatus, Prisma } from "@prisma/client";

export async function listCategories() {
  return db.assetCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function createCategory(input: CreateAssetCategoryInput) {
  // Check name uniqueness
  const existing = await db.assetCategory.findFirst({
    where: { name: { equals: input.name, mode: "insensitive" } },
  });
  if (existing) {
    throw new ConflictError("Category name already exists.");
  }

  // Validate that field schema contains unique field names
  if (input.fieldSchema && input.fieldSchema.length > 0) {
    const fieldNames = input.fieldSchema.map((f) => f.name.toLowerCase());
    const uniqueNames = new Set(fieldNames);
    if (uniqueNames.size !== fieldNames.length) {
      throw new BadRequestError("Field schema contains duplicate field names.");
    }
  }

  return db.assetCategory.create({
    data: {
      name: input.name,
      description: input.description || null,
      fieldSchema: input.fieldSchema
        ? (input.fieldSchema as Prisma.InputJsonValue)
        : Prisma.DbNull,
      status: CategoryStatus.ACTIVE,
    },
  });
}

export async function updateCategory(
  id: string,
  input: UpdateAssetCategoryInput,
) {
  const category = await db.assetCategory.findUnique({ where: { id } });
  if (!category) {
    throw new NotFoundError("Category not found.");
  }

  // Check name uniqueness if changed
  if (input.name && input.name.toLowerCase() !== category.name.toLowerCase()) {
    const existing = await db.assetCategory.findFirst({
      where: { name: { equals: input.name, mode: "insensitive" } },
    });
    if (existing) {
      throw new ConflictError("Category name already exists.");
    }
  }

  // Validate that field schema contains unique field names if provided
  if (input.fieldSchema && input.fieldSchema.length > 0) {
    const fieldNames = input.fieldSchema.map((f) => f.name.toLowerCase());
    const uniqueNames = new Set(fieldNames);
    if (uniqueNames.size !== fieldNames.length) {
      throw new BadRequestError("Field schema contains duplicate field names.");
    }
  }

  const statusMapped =
    input.status === "ACTIVE"
      ? CategoryStatus.ACTIVE
      : input.status === "INACTIVE"
        ? CategoryStatus.INACTIVE
        : undefined;

  return db.assetCategory.update({
    where: { id },
    data: {
      name: input.name,
      description:
        input.description !== undefined ? input.description : undefined,
      fieldSchema:
        input.fieldSchema !== undefined
          ? input.fieldSchema
            ? (input.fieldSchema as Prisma.InputJsonValue)
            : Prisma.DbNull
          : undefined,
      status: statusMapped,
    },
  });
}

export async function deleteCategory(id: string) {
  const category = await db.assetCategory.findUnique({ where: { id } });
  if (!category) {
    throw new NotFoundError("Category not found.");
  }

  // Check if any asset references this category
  const assetCount = await db.asset.count({
    where: { categoryId: id },
  });
  if (assetCount > 0) {
    throw new ConflictError(
      "Category is currently in use by active assets. Deactivate it instead.",
    );
  }

  return db.assetCategory.delete({
    where: { id },
  });
}
