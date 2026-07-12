import { db } from "../../lib/db.js";
import { eventBus } from "../../lib/event-bus.js";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../../lib/errors.js";
import { Role, AssetStatus, AllocationStatus, Prisma } from "@prisma/client";
import type { AllocateAssetInput, ReturnAssetInput } from "@template/shared";

export async function listAllocations(
  filters: {
    holderEmployeeId?: string;
    holderDepartmentId?: string;
    assetId?: string;
    status?: AllocationStatus;
    page?: number;
    pageSize?: number;
  },
  currentUser: { id: string; role: Role },
) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.AllocationWhereInput = {};

  // Apply filters
  if (filters.holderEmployeeId) {
    whereClause.holderEmployeeId = filters.holderEmployeeId;
  }
  if (filters.holderDepartmentId) {
    whereClause.holderDepartmentId = filters.holderDepartmentId;
  }
  if (filters.assetId) {
    whereClause.assetId = filters.assetId;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }

  // Role scoping: Admin & Asset Manager see everything.
  // Department Head is scoped to allocations belonging to their department or employees in their department.
  // Employee is scoped to their own allocations.
  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    if (!employee || !employee.departmentId) {
      throw new ForbiddenError(
        "Department Head must be assigned to a department to view allocations.",
      );
    }
    const deptId = employee.departmentId;
    whereClause.OR = [
      { holderDepartmentId: deptId },
      { holderEmployee: { departmentId: deptId } },
    ];
  } else if (currentUser.role === Role.EMPLOYEE) {
    whereClause.holderEmployeeId = currentUser.id;
  }

  const [allocations, totalCount] = await Promise.all([
    db.allocation.findMany({
      where: whereClause,
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true, status: true },
        },
        holderEmployee: {
          select: { id: true, name: true, email: true },
        },
        holderDepartment: {
          select: { id: true, name: true },
        },
      },
      orderBy: { allocatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.allocation.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: allocations,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}

export async function createAllocation(
  input: AllocateAssetInput,
  currentUser: { id: string; role: Role },
) {
  // Fetch asset details
  const asset = await db.asset.findUnique({
    where: { id: input.assetId },
  });
  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  // Validate status is AVAILABLE
  if (asset.status !== AssetStatus.AVAILABLE) {
    throw new BadRequestError(
      `Asset is not available for allocation. Current status: ${asset.status}`,
    );
  }

  // Permissions validation
  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    if (!employee || !employee.departmentId) {
      throw new ForbiddenError("Department Head must belong to a department.");
    }
    const deptId = employee.departmentId;

    // Check if target matches department head's department scope
    if (input.holderDepartmentId) {
      if (input.holderDepartmentId !== deptId) {
        throw new ForbiddenError(
          "Department Head can only allocate assets to their own department.",
        );
      }
    } else if (input.holderEmployeeId) {
      const targetEmployee = await db.employee.findUnique({
        where: { id: input.holderEmployeeId },
        select: { departmentId: true },
      });
      if (!targetEmployee || targetEmployee.departmentId !== deptId) {
        throw new ForbiddenError(
          "Department Head can only allocate assets to employees in their own department.",
        );
      }
    }
  } else if (
    currentUser.role !== Role.ADMIN &&
    currentUser.role !== Role.ASSET_MANAGER
  ) {
    throw new ForbiddenError("You do not have permission to allocate assets.");
  }

  // If allocating to employee, check employee existence
  if (input.holderEmployeeId) {
    const emp = await db.employee.findUnique({
      where: { id: input.holderEmployeeId },
    });
    if (!emp) {
      throw new NotFoundError("Holder employee not found.");
    }
  }

  // If allocating to department, check department existence
  if (input.holderDepartmentId) {
    const dept = await db.department.findUnique({
      where: { id: input.holderDepartmentId },
    });
    if (!dept) {
      throw new NotFoundError("Holder department not found.");
    }
  }

  // Perform transaction: Create Allocation, Update Asset status to ALLOCATED
  const allocation = await db.$transaction(async (tx) => {
    // Rely on index for safety, but check status again in transaction to minimize conflict window
    const currentAsset = await tx.asset.findUnique({
      where: { id: input.assetId },
      select: { status: true },
    });
    if (!currentAsset || currentAsset.status !== AssetStatus.AVAILABLE) {
      throw new BadRequestError("Asset is already allocated or unavailable.");
    }

    const created = await tx.allocation.create({
      data: {
        assetId: input.assetId,
        holderEmployeeId: input.holderEmployeeId || null,
        holderDepartmentId: input.holderDepartmentId || null,
        expectedReturnDate: input.expectedReturnDate
          ? new Date(input.expectedReturnDate)
          : null,
        status: AllocationStatus.ACTIVE,
      },
    });

    await tx.asset.update({
      where: { id: input.assetId },
      data: { status: AssetStatus.ALLOCATED },
    });

    return created;
  });

  // Publish domain event outside transaction
  eventBus.publish("asset.allocated", {
    assetId: asset.id,
    holderEmployeeId: allocation.holderEmployeeId || undefined,
    assetTag: asset.assetTag,
  });

  // Return full allocation object
  return db.allocation.findUnique({
    where: { id: allocation.id },
    include: {
      asset: true,
      holderEmployee: { select: { id: true, name: true, email: true } },
      holderDepartment: { select: { id: true, name: true } },
    },
  });
}

export async function returnAllocation(
  id: string,
  input: ReturnAssetInput,
  currentUser: { id: string; role: Role },
) {
  const allocation = await db.allocation.findUnique({
    where: { id },
    include: {
      asset: true,
      holderEmployee: true,
    },
  });

  if (!allocation) {
    throw new NotFoundError("Allocation not found.");
  }

  if (
    allocation.status === AllocationStatus.RETURNED ||
    allocation.returnedAt !== null
  ) {
    throw new BadRequestError("Allocation has already been returned.");
  }

  // Permissions validation
  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    if (!employee || !employee.departmentId) {
      throw new ForbiddenError("Department Head must belong to a department.");
    }
    const deptId = employee.departmentId;

    const belongsToDept =
      allocation.holderDepartmentId === deptId ||
      allocation.holderEmployee?.departmentId === deptId;

    if (!belongsToDept) {
      throw new ForbiddenError(
        "You can only return allocations belonging to your department.",
      );
    }
  } else if (
    currentUser.role !== Role.ADMIN &&
    currentUser.role !== Role.ASSET_MANAGER
  ) {
    throw new ForbiddenError("You do not have permission to return assets.");
  }

  // Update allocation to Returned and asset to Available
  const updated = await db.$transaction(async (tx) => {
    const res = await tx.allocation.update({
      where: { id },
      data: {
        returnedAt: new Date(),
        status: AllocationStatus.RETURNED,
        conditionAtReturn: input.conditionAtReturn,
      },
    });

    await tx.asset.update({
      where: { id: allocation.assetId },
      data: { status: AssetStatus.AVAILABLE },
    });

    return res;
  });

  return db.allocation.findUnique({
    where: { id: updated.id },
    include: {
      asset: true,
      holderEmployee: { select: { id: true, name: true, email: true } },
      holderDepartment: { select: { id: true, name: true } },
    },
  });
}
