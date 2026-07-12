import { db } from "../../lib/db.js";
import { eventBus } from "../../lib/event-bus.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../lib/errors.js";
import {
  Role,
  AssetStatus,
  MaintenanceStatus,
  MaintenancePriority,
  Prisma,
} from "@prisma/client";
import type {
  CreateMaintenanceRequestInput,
  ApproveMaintenanceRequestInput,
  RejectMaintenanceRequestInput,
} from "@template/shared";

export async function listMaintenanceRequests(
  filters: {
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    assetId?: string;
    page?: number;
    pageSize?: number;
  },
  currentUser: { id: string; role: Role },
) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.MaintenanceRequestWhereInput = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }
  if (filters.priority) {
    whereClause.priority = filters.priority;
  }
  if (filters.assetId) {
    whereClause.assetId = filters.assetId;
  }

  // Scoping rules:
  // Admin & Asset Manager can see all.
  // Department Head can see requests raised by employees in their department or on assets belonging to their department.
  // Employee can see requests they raised.
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
      { raisedBy: { departmentId: deptId } },
      { asset: { locationDepartmentId: deptId } },
    ];
  } else if (currentUser.role === Role.EMPLOYEE) {
    whereClause.raisedByEmployeeId = currentUser.id;
  }

  const [requests, totalCount] = await Promise.all([
    db.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true, status: true },
        },
        raisedBy: {
          select: { id: true, name: true, email: true },
        },
        decidedBy: {
          select: { id: true, name: true },
        },
        technician: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.maintenanceRequest.count({ where: whereClause }),
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

export async function createMaintenanceRequest(
  input: CreateMaintenanceRequestInput,
  currentUser: { id: string; role: Role },
) {
  const asset = await db.asset.findUnique({
    where: { id: input.assetId },
  });

  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  const request = await db.maintenanceRequest.create({
    data: {
      assetId: input.assetId,
      raisedByEmployeeId: currentUser.id,
      issueDescription: input.issueDescription,
      priority: input.priority,
      photoUrl: input.photoUrl || null,
      status: MaintenanceStatus.PENDING,
    },
  });

  // Emit event (can be used for custom subscriber hooks if added in future)
  eventBus.publish("maintenancerequest.created", {
    requestId: request.id,
    assetId: asset.id,
    assetTag: asset.assetTag,
    raisedById: currentUser.id,
  });

  return db.maintenanceRequest.findUnique({
    where: { id: request.id },
    include: {
      asset: true,
      raisedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function approveMaintenanceRequest(
  id: string,
  input: ApproveMaintenanceRequestInput,
  currentUser: { id: string; role: Role },
) {
  const request = await db.maintenanceRequest.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!request) {
    throw new NotFoundError("Maintenance request not found.");
  }

  if (request.status !== MaintenanceStatus.PENDING) {
    throw new BadRequestError(
      "Maintenance request is not in PENDING state.",
      "NOT_IN_PENDING_STATE",
    );
  }

  // Verify technician employee exists and is active
  const technician = await db.employee.findUnique({
    where: { id: input.technicianEmployeeId },
  });
  if (!technician) {
    throw new NotFoundError("Technician employee not found.");
  }
  if (technician.status !== "ACTIVE") {
    throw new BadRequestError("Technician employee must be active.");
  }

  // Update request to APPROVED and asset status to UNDER_MAINTENANCE
  const updated = await db.$transaction(async (tx) => {
    const req = await tx.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.APPROVED,
        decidedByEmployeeId: currentUser.id,
        decidedAt: new Date(),
        technicianEmployeeId: input.technicianEmployeeId,
      },
    });

    await tx.asset.update({
      where: { id: request.assetId },
      data: { status: AssetStatus.UNDER_MAINTENANCE },
    });

    return req;
  });

  // Emit event matching subscriber in notification.subscriber.ts
  eventBus.publish("maintenancerequest.approved", {
    requestId: updated.id,
    assetId: request.assetId,
    assetTag: request.asset.assetTag,
    raisedById: updated.raisedByEmployeeId,
    actorId: currentUser.id,
  });

  return db.maintenanceRequest.findUnique({
    where: { id: updated.id },
    include: {
      asset: true,
      raisedBy: { select: { id: true, name: true, email: true } },
      decidedBy: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
  });
}

export async function rejectMaintenanceRequest(
  id: string,
  input: RejectMaintenanceRequestInput,
  currentUser: { id: string; role: Role },
) {
  const request = await db.maintenanceRequest.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!request) {
    throw new NotFoundError("Maintenance request not found.");
  }

  if (request.status !== MaintenanceStatus.PENDING) {
    throw new BadRequestError(
      "Maintenance request is not in PENDING state.",
      "NOT_IN_PENDING_STATE",
    );
  }

  const updated = await db.maintenanceRequest.update({
    where: { id },
    data: {
      status: MaintenanceStatus.REJECTED,
      decidedByEmployeeId: currentUser.id,
      decidedAt: new Date(),
      rejectionReason: input.rejectionReason,
    },
  });

  // Emit event matching subscriber in notification.subscriber.ts
  eventBus.publish("maintenancerequest.rejected", {
    requestId: updated.id,
    assetTag: request.asset.assetTag,
    raisedById: updated.raisedByEmployeeId,
    reason: input.rejectionReason,
    actorId: currentUser.id,
  });

  return db.maintenanceRequest.findUnique({
    where: { id: updated.id },
    include: {
      asset: true,
      raisedBy: { select: { id: true, name: true, email: true } },
      decidedBy: { select: { id: true, name: true } },
    },
  });
}

export async function assignTechnician(
  id: string,
  input: ApproveMaintenanceRequestInput,
  _currentUser: { id: string; role: Role },
) {
  const request = await db.maintenanceRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new NotFoundError("Maintenance request not found.");
  }

  // Transition from APPROVED or TECHNICIAN_ASSIGNED is allowed
  if (
    request.status !== MaintenanceStatus.APPROVED &&
    request.status !== MaintenanceStatus.TECHNICIAN_ASSIGNED
  ) {
    throw new BadRequestError(
      "Technician can only be assigned to approved or technician-assigned requests.",
    );
  }

  const technician = await db.employee.findUnique({
    where: { id: input.technicianEmployeeId },
  });
  if (!technician) {
    throw new NotFoundError("Technician employee not found.");
  }

  const updated = await db.maintenanceRequest.update({
    where: { id },
    data: {
      status: MaintenanceStatus.TECHNICIAN_ASSIGNED,
      technicianEmployeeId: input.technicianEmployeeId,
    },
  });

  return db.maintenanceRequest.findUnique({
    where: { id: updated.id },
    include: {
      asset: true,
      raisedBy: { select: { id: true, name: true, email: true } },
      decidedBy: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
  });
}

export async function startMaintenance(
  id: string,
  _currentUser: { id: string; role: Role },
) {
  const request = await db.maintenanceRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new NotFoundError("Maintenance request not found.");
  }

  // Approve allows direct start or technician assignment start
  if (
    request.status !== MaintenanceStatus.PENDING &&
    request.status !== MaintenanceStatus.APPROVED &&
    request.status !== MaintenanceStatus.TECHNICIAN_ASSIGNED
  ) {
    throw new BadRequestError(
      "Maintenance can only start for pending, approved, or technician-assigned requests.",
    );
  }

  const updated = await db.$transaction(async (tx) => {
    const req = await tx.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });

    await tx.asset.update({
      where: { id: request.assetId },
      data: { status: AssetStatus.UNDER_MAINTENANCE },
    });

    return req;
  });

  return db.maintenanceRequest.findUnique({
    where: { id: updated.id },
    include: {
      asset: true,
      raisedBy: { select: { id: true, name: true, email: true } },
      decidedBy: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
  });
}

export async function resolveMaintenance(
  id: string,
  _currentUser: { id: string; role: Role },
) {
  const request = await db.maintenanceRequest.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!request) {
    throw new NotFoundError("Maintenance request not found.");
  }

  if (request.status !== MaintenanceStatus.IN_PROGRESS) {
    throw new BadRequestError(
      "Maintenance must be in IN_PROGRESS state to resolve.",
    );
  }

  // Transactionally: Resolve Request, Revert Asset status based on Precedence Rule
  const updated = await db.$transaction(async (tx) => {
    const req = await tx.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });

    // Check if asset currently has an active allocation
    const activeAllocation = await tx.allocation.findFirst({
      where: {
        assetId: request.assetId,
        returnedAt: null,
      },
    });

    const targetAssetStatus = activeAllocation
      ? AssetStatus.ALLOCATED
      : AssetStatus.AVAILABLE;

    await tx.asset.update({
      where: { id: request.assetId },
      data: { status: targetAssetStatus },
    });

    return req;
  });

  // Query active allocation for event emitter payload
  const activeAllocation = await db.allocation.findFirst({
    where: {
      assetId: request.assetId,
      returnedAt: null,
    },
  });

  // Emit event matching subscriber in notification.subscriber.ts
  eventBus.publish("maintenancerequest.resolved", {
    requestId: updated.id,
    assetId: request.assetId,
    assetTag: request.asset.assetTag,
    raisedById: updated.raisedByEmployeeId,
    actorId: _currentUser.id,
    currentHolderId: activeAllocation?.holderEmployeeId || undefined,
  });

  return db.maintenanceRequest.findUnique({
    where: { id: updated.id },
    include: {
      asset: true,
      raisedBy: { select: { id: true, name: true, email: true } },
      decidedBy: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
  });
}
