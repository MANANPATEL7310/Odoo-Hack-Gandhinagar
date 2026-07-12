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
  AuditStatus,
  AuditItemStatus,
  Prisma,
} from "@prisma/client";
import type {
  CreateAuditCycleInput,
  MarkAuditItemInput,
} from "@template/shared";

export async function listAuditCycles(
  filters: {
    status?: AuditStatus;
    page?: number;
    pageSize?: number;
  },
  currentUser: { id: string; role: Role },
) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.AuditCycleWhereInput = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }

  // Scoping rules:
  // Admin & Asset Manager can see all.
  // Others can only see cycles where they are assigned as auditors.
  if (
    currentUser.role !== Role.ADMIN &&
    currentUser.role !== Role.ASSET_MANAGER
  ) {
    whereClause.auditors = {
      some: { employeeId: currentUser.id },
    };
  }

  const [cycles, totalCount] = await Promise.all([
    db.auditCycle.findMany({
      where: whereClause,
      include: {
        scopeDepartment: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        auditors: {
          include: {
            employee: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.auditCycle.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: cycles,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}

export async function getAuditCycle(
  id: string,
  currentUser: { id: string; role: Role },
) {
  const cycle = await db.auditCycle.findUnique({
    where: { id },
    include: {
      scopeDepartment: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      auditors: {
        include: {
          employee: { select: { id: true, name: true } },
        },
      },
      items: {
        include: {
          asset: {
            select: { id: true, name: true, assetTag: true, status: true },
          },
          markedBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!cycle) {
    throw new NotFoundError("Audit cycle not found.");
  }

  // Scoping check
  if (
    currentUser.role !== Role.ADMIN &&
    currentUser.role !== Role.ASSET_MANAGER &&
    !cycle.auditors.some((a) => a.employeeId === currentUser.id)
  ) {
    throw new ForbiddenError(
      "You are not authorized to view this audit cycle.",
    );
  }

  return cycle;
}

export async function createAuditCycle(
  input: CreateAuditCycleInput,
  currentUser: { id: string; role: Role },
) {
  if (!input.scopeDepartmentId && !input.scopeLocation) {
    throw new BadRequestError(
      "At least one scope (department or location) must be specified.",
    );
  }

  // Check that all auditors are active employees
  const activeAuditors = await db.employee.findMany({
    where: {
      id: { in: input.auditorEmployeeIds },
      status: "ACTIVE",
    },
  });

  if (activeAuditors.length !== input.auditorEmployeeIds.length) {
    throw new BadRequestError(
      "One or more assigned auditors are inactive or do not exist.",
    );
  }

  // Define asset snapshot criteria
  const assetWhere: Prisma.AssetWhereInput = {
    status: { notIn: [AssetStatus.RETIRED, AssetStatus.DISPOSED] },
  };

  const orConditions: Prisma.AssetWhereInput[] = [];

  if (input.scopeDepartmentId) {
    orConditions.push({ locationDepartmentId: input.scopeDepartmentId });
  }

  if (input.scopeLocation) {
    orConditions.push({
      location: {
        name: { contains: input.scopeLocation, mode: "insensitive" },
      },
    });
  }

  if (orConditions.length > 0) {
    assetWhere.OR = orConditions;
  }

  const cycle = await db.$transaction(
    async (tx) => {
      // 1. Create AuditCycle
      const createdCycle = await tx.auditCycle.create({
        data: {
          scopeDepartmentId: input.scopeDepartmentId || null,
          scopeLocation: input.scopeLocation || null,
          startDate: input.startDate,
          endDate: input.endDate,
          status: AuditStatus.OPEN,
          createdByEmployeeId: currentUser.id,
          auditors: {
            create: input.auditorEmployeeIds.map((empId) => ({
              employeeId: empId,
            })),
          },
        },
      });

      // 2. Fetch in-scope assets
      const assets = await tx.asset.findMany({
        where: assetWhere,
        select: { id: true },
      });

      // 3. Create items
      if (assets.length > 0) {
        await tx.auditCycleItem.createMany({
          data: assets.map((asset) => ({
            auditCycleId: createdCycle.id,
            assetId: asset.id,
            status: AuditItemStatus.UNVERIFIED,
          })),
        });
      }

      return createdCycle;
    },
    { timeout: 20000 },
  );

  eventBus.publish("audit:created", {
    cycleId: cycle.id,
    actorId: currentUser.id,
  });

  return getAuditCycle(cycle.id, currentUser);
}

export async function markAuditItem(
  itemId: string,
  input: MarkAuditItemInput,
  currentUser: { id: string; role: Role },
) {
  const item = await db.auditCycleItem.findUnique({
    where: { id: itemId },
    include: {
      auditCycle: {
        include: {
          auditors: true,
        },
      },
    },
  });

  if (!item) {
    throw new NotFoundError("Audit item not found.");
  }

  if (item.auditCycle.status !== AuditStatus.OPEN) {
    throw new BadRequestError(
      "Cycle is already closed.",
      "CYCLE_ALREADY_CLOSED",
    );
  }

  // Permission check: Assigned auditors only
  const isAssigned = item.auditCycle.auditors.some(
    (a) => a.employeeId === currentUser.id,
  );
  if (!isAssigned) {
    throw new ForbiddenError(
      "You are not an assigned auditor for this audit cycle.",
      "NOT_ASSIGNED_AUDITOR",
    );
  }

  const updated = await db.auditCycleItem.update({
    where: { id: itemId },
    data: {
      status: input.status,
      notes: input.notes || null,
      markedByEmployeeId: currentUser.id,
      markedAt: new Date(),
    },
  });

  eventBus.publish("audit:item_marked", {
    itemId: updated.id,
    status: updated.status,
    actorId: currentUser.id,
  });

  return db.auditCycleItem.findUnique({
    where: { id: itemId },
    include: {
      asset: { select: { id: true, name: true, assetTag: true } },
      markedBy: { select: { id: true, name: true } },
    },
  });
}

export async function closeAuditCycle(
  id: string,
  currentUser: { id: string; role: Role },
) {
  const cycle = await db.auditCycle.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          asset: true,
        },
      },
    },
  });

  if (!cycle) {
    throw new NotFoundError("Audit cycle not found.");
  }

  if (cycle.status === AuditStatus.CLOSED) {
    throw new BadRequestError("Cycle is already closed.", "ALREADY_CLOSED");
  }

  // Run transactional updates: Unverified -> Unresolved, Missing -> Asset.status = Lost
  const result = await db.$transaction(
    async (tx) => {
      // 1. Revert Unverified to Unresolved
      await tx.auditCycleItem.updateMany({
        where: {
          auditCycleId: id,
          status: AuditItemStatus.UNVERIFIED,
        },
        data: {
          status: AuditItemStatus.UNRESOLVED,
        },
      });

      // 2. Locate Missing items and update Asset status to LOST
      const missingItems = cycle.items.filter(
        (item) => item.status === AuditItemStatus.MISSING,
      );
      if (missingItems.length > 0) {
        await tx.asset.updateMany({
          where: {
            id: { in: missingItems.map((item) => item.assetId) },
          },
          data: {
            status: AssetStatus.LOST,
          },
        });
      }

      // 3. Update AuditCycle
      return tx.auditCycle.update({
        where: { id },
        data: {
          status: AuditStatus.CLOSED,
          closedAt: new Date(),
        },
      });
    },
    { timeout: 20000 },
  );

  // Calculate discrepancies
  const items = await db.auditCycleItem.findMany({
    where: { auditCycleId: id },
  });

  const discrepancyReport = {
    totalItems: items.length,
    verifiedCount: items.filter(
      (item) => item.status === AuditItemStatus.VERIFIED,
    ).length,
    missingCount: items.filter(
      (item) => item.status === AuditItemStatus.MISSING,
    ).length,
    damagedCount: items.filter(
      (item) => item.status === AuditItemStatus.DAMAGED,
    ).length,
    unresolvedCount: items.filter(
      (item) => item.status === AuditItemStatus.UNRESOLVED,
    ).length,
  };

  eventBus.publish("audit:closed", {
    cycleId: result.id,
    actorId: currentUser.id,
  });

  const updatedCycle = await getAuditCycle(result.id, currentUser);

  return {
    data: updatedCycle,
    discrepancyReport,
  };
}
