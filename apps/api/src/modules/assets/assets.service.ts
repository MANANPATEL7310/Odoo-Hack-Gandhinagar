import { db } from "../../lib/db.js";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../../lib/errors.js";
import { validateCategoryMetadata } from "../../lib/validation.js";
import { Role, AssetStatus, CategoryStatus, Prisma } from "@prisma/client";
import type { CreateAssetInput, UpdateAssetInput } from "@template/shared";

export async function listAssets(
  filters: {
    search?: string;
    categoryId?: string;
    status?: AssetStatus;
    departmentId?: string;
    isBookable?: boolean;
    page?: number;
    pageSize?: number;
  },
  currentUser: { id: string; role: Role },
) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.AssetWhereInput = {};

  // Role scoping
  if (currentUser.role === Role.EMPLOYEE) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    const userDeptId = employee?.departmentId;

    // Employees see bookable assets OR assets currently allocated to them/their department
    whereClause.OR = [
      { isBookable: true },
      {
        allocations: {
          some: {
            status: "ACTIVE",
            OR: [
              { holderEmployeeId: currentUser.id },
              ...(userDeptId ? [{ holderDepartmentId: userDeptId }] : []),
            ],
          },
        },
      },
    ];
  }

  // Filter overrides
  if (filters.categoryId) {
    whereClause.categoryId = filters.categoryId;
  }

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.departmentId) {
    whereClause.locationDepartmentId = filters.departmentId;
  }

  if (filters.isBookable !== undefined) {
    whereClause.isBookable = filters.isBookable;
  }

  if (filters.search) {
    whereClause.AND = {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { assetTag: { contains: filters.search, mode: "insensitive" } },
        { serialNumber: { contains: filters.search, mode: "insensitive" } },
        { qrCode: { contains: filters.search, mode: "insensitive" } },
      ],
    };
  }

  const [assets, totalCount] = await Promise.all([
    db.asset.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: {
        assetTag: "asc",
      },
    }),
    db.asset.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: assets,
    pagination: {
      totalCount,
      page,
      pageSize,
      totalPages,
    },
  };
}

export async function getAssetById(id: string) {
  const asset = await db.asset.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      allocations: {
        include: {
          holderEmployee: {
            select: { id: true, name: true, email: true },
          },
          holderDepartment: {
            select: { id: true, name: true },
          },
        },
        orderBy: { allocatedAt: "desc" },
      },
      maintenanceRequests: {
        include: {
          raisedBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  return asset;
}

export async function createAsset(input: CreateAssetInput) {
  // Check category validity
  const category = await db.assetCategory.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) {
    throw new NotFoundError("Asset category not found.");
  }
  if (category.status !== CategoryStatus.ACTIVE) {
    throw new BadRequestError("Asset category is inactive.");
  }

  // Validate serial number uniqueness
  if (input.serialNumber) {
    const existingSerial = await db.asset.findUnique({
      where: { serialNumber: input.serialNumber },
    });
    if (existingSerial) {
      throw new ConflictError("Serial number already exists.");
    }
  }

  // Validate dynamic metadata against category's fieldSchema
  if (input.categoryMetadata) {
    const validationResult = validateCategoryMetadata(
      input.categoryMetadata,
      category.fieldSchema,
    );
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid category metadata: ${validationResult.error}`,
      );
    }
  }

  // Validate acquisition cost
  if (
    input.acquisitionCost !== undefined &&
    input.acquisitionCost !== null &&
    input.acquisitionCost < 0
  ) {
    throw new BadRequestError("Acquisition cost cannot be negative.");
  }

  // Generate sequence-based tag using postgres sequence nextval
  const seqResult = await db.$queryRawUnsafe<{ nextval: string }[]>(
    `SELECT nextval('asset_tag_seq')::text as nextval;`,
  );

  if (!seqResult[0] || !seqResult[0].nextval) {
    throw new Error("Failed to retrieve next sequence value from database.");
  }

  const nextNum = parseInt(seqResult[0].nextval, 10);
  const assetTag = `AF-${String(nextNum).padStart(4, "0")}`;

  return db.asset.create({
    data: {
      assetTag,
      name: input.name,
      categoryId: input.categoryId,
      serialNumber: input.serialNumber || null,
      qrCode: input.qrCode || null,
      acquisitionDate: input.acquisitionDate
        ? new Date(input.acquisitionDate)
        : null,
      acquisitionCost: input.acquisitionCost || null,
      condition: input.condition || null,
      locationDepartmentId: input.locationDepartmentId || null,
      status: AssetStatus.AVAILABLE,
      isBookable: input.isBookable || false,
      photoUrls: input.photoUrls || [],
      documentUrls: input.documentUrls || [],
      categoryMetadata: input.categoryMetadata
        ? (input.categoryMetadata as Prisma.InputJsonValue)
        : Prisma.DbNull,
    },
  });
}

export async function updateAsset(id: string, input: UpdateAssetInput) {
  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  // Block direct status changes
  if ("status" in input) {
    throw new BadRequestError(
      "Asset status cannot be modified directly. Use workflow endpoints.",
    );
  }

  // Validate category if changing
  let categorySchema: Prisma.JsonValue | null | undefined = null;
  if (input.categoryId && input.categoryId !== asset.categoryId) {
    const category = await db.assetCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new NotFoundError("Asset category not found.");
    }
    if (category.status !== CategoryStatus.ACTIVE) {
      throw new BadRequestError("Asset category is inactive.");
    }
    categorySchema = category.fieldSchema;
  } else if (input.categoryMetadata) {
    // Retrieve schema for validation
    const category = await db.assetCategory.findUnique({
      where: { id: asset.categoryId },
    });
    categorySchema = category?.fieldSchema;
  }

  // Validate dynamic metadata if provided
  if (input.categoryMetadata) {
    const validationResult = validateCategoryMetadata(
      input.categoryMetadata,
      categorySchema,
    );
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid category metadata: ${validationResult.error}`,
      );
    }
  }

  return db.asset.update({
    where: { id },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      serialNumber: input.serialNumber,
      qrCode: input.qrCode,
      acquisitionDate: input.acquisitionDate
        ? new Date(input.acquisitionDate)
        : undefined,
      acquisitionCost: input.acquisitionCost,
      condition: input.condition,
      locationDepartmentId: input.locationDepartmentId,
      isBookable: input.isBookable,
      photoUrls: input.photoUrls,
      documentUrls: input.documentUrls,
      categoryMetadata:
        input.categoryMetadata !== undefined
          ? input.categoryMetadata
            ? (input.categoryMetadata as Prisma.InputJsonValue)
            : Prisma.DbNull
          : undefined,
    },
  });
}

export async function retireAsset(id: string) {
  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  // Valid only from non-terminal states
  const terminalStates: AssetStatus[] = [
    AssetStatus.RETIRED,
    AssetStatus.DISPOSED,
    AssetStatus.LOST,
  ];
  if (terminalStates.includes(asset.status)) {
    throw new BadRequestError(
      `Cannot retire asset from terminal state: ${asset.status}`,
    );
  }

  return db.asset.update({
    where: { id },
    data: { status: AssetStatus.RETIRED },
  });
}

export async function disposeAsset(id: string) {
  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  // Valid only if currently Retired
  if (asset.status !== AssetStatus.RETIRED) {
    throw new BadRequestError(
      `Asset must be Retired before it can be disposed. Current status: ${asset.status}`,
    );
  }

  return db.asset.update({
    where: { id },
    data: { status: AssetStatus.DISPOSED },
  });
}
