import { db } from "../../lib/db.js";
import { eventBus } from "../../lib/event-bus.js";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../../lib/errors.js";
import {
  Role,
  AssetStatus,
  AllocationStatus,
  TransferStatus,
  Prisma,
} from "@prisma/client";
import type {
  TransferAssetInput,
  RejectTransferRequestInput,
} from "@template/shared";

export async function listTransferRequests(
  filters: {
    assetId?: string;
    status?: TransferStatus;
    page?: number;
    pageSize?: number;
  },
  currentUser: { id: string; role: Role },
) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.TransferRequestWhereInput = {};

  if (filters.assetId) {
    whereClause.assetId = filters.assetId;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }

  // Scoping rules:
  // Admin & Asset Manager can see all.
  // Department Head can see requests where requester belongs to their department OR target department/employee is theirs.
  // Employee can see requests they requested OR they are the target employee.
  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    if (!employee || !employee.departmentId) {
      throw new ForbiddenError("Department Head must belong to a department.");
    }
    const deptId = employee.departmentId;
    whereClause.OR = [
      { requestedBy: { departmentId: deptId } },
      { targetDepartmentId: deptId },
      { targetEmployee: { departmentId: deptId } },
    ];
  } else if (currentUser.role === Role.EMPLOYEE) {
    whereClause.OR = [
      { requestedByEmployeeId: currentUser.id },
      { targetEmployeeId: currentUser.id },
    ];
  }

  const [requests, totalCount] = await Promise.all([
    db.transferRequest.findMany({
      where: whereClause,
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true, status: true },
        },
        requestedBy: {
          select: { id: true, name: true, email: true },
        },
        targetEmployee: {
          select: { id: true, name: true, email: true },
        },
        targetDepartment: {
          select: { id: true, name: true },
        },
        decidedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.transferRequest.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: requests,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}

export async function createTransferRequest(
  input: TransferAssetInput & { assetId: string },
  currentUser: { id: string; role: Role; name?: string },
) {
  const asset = await db.asset.findUnique({
    where: { id: input.assetId },
  });
  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  // Find active allocation for the asset
  const activeAllocation = await db.allocation.findFirst({
    where: {
      assetId: input.assetId,
      returnedAt: null,
      status: AllocationStatus.ACTIVE,
    },
    include: {
      holderEmployee: true,
    },
  });

  if (!activeAllocation) {
    throw new BadRequestError(
      "Asset must be currently allocated to request a transfer.",
    );
  }

  // Validate permission:
  // Employees can only request transfer for assets currently allocated to them.
  // Department Heads can request transfer for assets allocated to their department or employees in their department.
  if (currentUser.role === Role.EMPLOYEE) {
    if (activeAllocation.holderEmployeeId !== currentUser.id) {
      throw new ForbiddenError(
        "You can only request transfers for assets currently allocated to you.",
      );
    }
  } else if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    if (!employee || !employee.departmentId) {
      throw new ForbiddenError("Department Head must belong to a department.");
    }
    const deptId = employee.departmentId;

    const belongsToDept =
      activeAllocation.holderDepartmentId === deptId ||
      activeAllocation.holderEmployee?.departmentId === deptId;

    if (!belongsToDept) {
      throw new ForbiddenError(
        "You can only request transfers for assets allocated within your department.",
      );
    }
  }

  // Verify target employee/department existence
  if (input.targetEmployeeId) {
    const targetEmp = await db.employee.findUnique({
      where: { id: input.targetEmployeeId },
    });
    if (!targetEmp) {
      throw new NotFoundError("Target employee not found.");
    }
  }
  if (input.targetDepartmentId) {
    const targetDept = await db.department.findUnique({
      where: { id: input.targetDepartmentId },
    });
    if (!targetDept) {
      throw new NotFoundError("Target department not found.");
    }
  }

  const request = await db.transferRequest.create({
    data: {
      assetId: input.assetId,
      currentAllocationId: activeAllocation.id,
      requestedByEmployeeId: currentUser.id,
      targetEmployeeId: input.targetEmployeeId || null,
      targetDepartmentId: input.targetDepartmentId || null,
      reason: input.reason || null,
      status: TransferStatus.REQUESTED,
    },
  });

  eventBus.publish("transferrequest.created", {
    requestId: request.id,
    assetId: asset.id,
    assetTag: asset.assetTag,
    requestedById: currentUser.id,
    requestedByName: currentUser.name || "Employee",
    targetDepartmentId: request.targetDepartmentId || undefined,
  });

  eventBus.publish("transfer:requested", {
    requestId: request.id,
    assetId: asset.id,
    requesterId: currentUser.id,
  });

  return db.transferRequest.findUnique({
    where: { id: request.id },
    include: {
      asset: true,
      requestedBy: { select: { id: true, name: true, email: true } },
      targetEmployee: { select: { id: true, name: true, email: true } },
      targetDepartment: { select: { id: true, name: true } },
    },
  });
}

export async function approveTransferRequest(
  id: string,
  currentUser: { id: string; role: Role },
) {
  const request = await db.transferRequest.findUnique({
    where: { id },
    include: {
      currentAllocation: true,
      targetEmployee: true,
      asset: true,
    },
  });

  if (!request) {
    throw new NotFoundError("Transfer request not found.");
  }

  if (request.status !== TransferStatus.REQUESTED) {
    throw new BadRequestError(
      `Transfer request cannot be approved. Current status: ${request.status}`,
    );
  }

  // Ensure the underlying allocation is still active (not returned in the meantime)
  if (
    request.currentAllocation.returnedAt !== null ||
    request.currentAllocation.status !== AllocationStatus.ACTIVE
  ) {
    throw new BadRequestError(
      "The underlying allocation has already been closed.",
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

    // Head can approve if target is within their department
    const isTargetDept = request.targetDepartmentId === deptId;
    const isTargetEmpDept = request.targetEmployee?.departmentId === deptId;

    if (!isTargetDept && !isTargetEmpDept) {
      throw new ForbiddenError(
        "You can only approve transfers targeting your department/employees.",
      );
    }
  } else if (
    currentUser.role !== Role.ADMIN &&
    currentUser.role !== Role.ASSET_MANAGER
  ) {
    throw new ForbiddenError(
      "You do not have permission to approve transfer requests.",
    );
  }

  // Perform transactional approve
  const approved = await db.$transaction(async (tx) => {
    // 1. Close current allocation
    await tx.allocation.update({
      where: { id: request.currentAllocationId },
      data: {
        returnedAt: new Date(),
        status: AllocationStatus.RETURNED,
        conditionAtReturn: "Transferred",
      },
    });

    // 2. Open new allocation for target
    await tx.allocation.create({
      data: {
        assetId: request.assetId,
        holderEmployeeId: request.targetEmployeeId || null,
        holderDepartmentId: request.targetDepartmentId || null,
        status: AllocationStatus.ACTIVE,
      },
    });

    // 3. Approve transfer request
    const reqUpdated = await tx.transferRequest.update({
      where: { id },
      data: {
        status: TransferStatus.APPROVED,
        decidedByEmployeeId: currentUser.id,
        decidedAt: new Date(),
      },
    });

    // 4. Ensure Asset status remains Allocated
    await tx.asset.update({
      where: { id: request.assetId },
      data: { status: AssetStatus.ALLOCATED },
    });

    return reqUpdated;
  });

  // Emit event outside transaction
  eventBus.publish("transferrequest.approved", {
    requestId: approved.id,
    assetId: request.assetId,
    assetTag: request.asset.assetTag,
    requestedById: approved.requestedByEmployeeId,
    targetEmployeeId: approved.targetEmployeeId || undefined,
  });

  eventBus.publish("transfer:decided", {
    requestId: approved.id,
    assetId: request.assetId,
    status: "APPROVED",
    actorId: currentUser.id,
  });

  return db.transferRequest.findUnique({
    where: { id: approved.id },
    include: {
      asset: true,
      requestedBy: { select: { id: true, name: true, email: true } },
      targetEmployee: { select: { id: true, name: true, email: true } },
      targetDepartment: { select: { id: true, name: true } },
      decidedBy: { select: { id: true, name: true } },
    },
  });
}

export async function rejectTransferRequest(
  id: string,
  input: RejectTransferRequestInput,
  currentUser: { id: string; role: Role },
) {
  const request = await db.transferRequest.findUnique({
    where: { id },
    include: {
      targetEmployee: true,
      asset: true,
    },
  });

  if (!request) {
    throw new NotFoundError("Transfer request not found.");
  }

  if (request.status !== TransferStatus.REQUESTED) {
    throw new BadRequestError(
      `Transfer request cannot be rejected. Current status: ${request.status}`,
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

    const isTargetDept = request.targetDepartmentId === deptId;
    const isTargetEmpDept = request.targetEmployee?.departmentId === deptId;

    if (!isTargetDept && !isTargetEmpDept) {
      throw new ForbiddenError(
        "You can only reject transfers targeting your department/employees.",
      );
    }
  } else if (
    currentUser.role !== Role.ADMIN &&
    currentUser.role !== Role.ASSET_MANAGER
  ) {
    throw new ForbiddenError(
      "You do not have permission to reject transfer requests.",
    );
  }

  const rejected = await db.transferRequest.update({
    where: { id },
    data: {
      status: TransferStatus.REJECTED,
      decidedByEmployeeId: currentUser.id,
      decidedAt: new Date(),
      reason: input.reason,
    },
  });

  eventBus.publish("transferrequest.rejected", {
    requestId: rejected.id,
    assetTag: request.asset.assetTag,
    requestedById: rejected.requestedByEmployeeId,
    reason: input.reason,
  });

  eventBus.publish("transfer:decided", {
    requestId: rejected.id,
    assetId: request.assetId,
    status: "REJECTED",
    actorId: currentUser.id,
  });

  return db.transferRequest.findUnique({
    where: { id: rejected.id },
    include: {
      asset: true,
      requestedBy: { select: { id: true, name: true, email: true } },
      targetEmployee: { select: { id: true, name: true, email: true } },
      targetDepartment: { select: { id: true, name: true } },
      decidedBy: { select: { id: true, name: true } },
    },
  });
}
