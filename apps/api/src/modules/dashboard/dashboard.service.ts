import { db } from "../../lib/db.js";
import {
  Role,
  AssetStatus,
  AuditStatus,
  MaintenanceStatus,
  TransferStatus,
  Prisma,
} from "@prisma/client";

export async function getDashboardData(currentUser: {
  id: string;
  role: Role;
}) {
  const now = new Date();

  // 1. Fetch KPI Metrics based on role
  let kpis: Record<string, number> = {};

  if (
    currentUser.role === Role.ADMIN ||
    currentUser.role === Role.ASSET_MANAGER
  ) {
    const [
      totalAssets,
      allocatedAssets,
      availableAssets,
      maintenanceAssets,
      pendingTransfers,
      openAudits,
    ] = await Promise.all([
      db.asset.count(),
      db.asset.count({ where: { status: AssetStatus.ALLOCATED } }),
      db.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
      db.asset.count({ where: { status: AssetStatus.UNDER_MAINTENANCE } }),
      db.transferRequest.count({ where: { status: TransferStatus.REQUESTED } }),
      db.auditCycle.count({ where: { status: AuditStatus.OPEN } }),
    ]);

    kpis = {
      totalAssets,
      allocatedAssets,
      availableAssets,
      maintenanceAssets,
      pendingTransfers,
      openAudits,
    };
  } else if (currentUser.role === Role.DEPARTMENT_HEAD) {
    // Get department ID
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    const deptId = employee?.departmentId || "";

    const [
      totalAssets,
      activeAllocations,
      pendingTransfers,
      activeMaintenance,
    ] = await Promise.all([
      db.asset.count({ where: { locationDepartmentId: deptId } }),
      db.allocation.count({
        where: {
          returnedAt: null,
          OR: [
            { holderDepartmentId: deptId },
            { holderEmployee: { departmentId: deptId } },
          ],
        },
      }),
      db.transferRequest.count({
        where: {
          status: TransferStatus.REQUESTED,
          OR: [
            { requestedBy: { departmentId: deptId } },
            { targetDepartmentId: deptId },
          ],
        },
      }),
      db.maintenanceRequest.count({
        where: {
          status: {
            in: [
              MaintenanceStatus.PENDING,
              MaintenanceStatus.APPROVED,
              MaintenanceStatus.TECHNICIAN_ASSIGNED,
              MaintenanceStatus.IN_PROGRESS,
            ],
          },
          asset: { locationDepartmentId: deptId },
        },
      }),
    ]);

    kpis = {
      totalAssets,
      activeAllocations,
      pendingTransfers,
      activeMaintenance,
    };
  } else {
    // Employee Role
    const [
      activeAllocations,
      pendingTransfers,
      upcomingBookings,
      activeMaintenance,
    ] = await Promise.all([
      db.allocation.count({
        where: {
          holderEmployeeId: currentUser.id,
          returnedAt: null,
        },
      }),
      db.transferRequest.count({
        where: {
          status: TransferStatus.REQUESTED,
          requestedByEmployeeId: currentUser.id,
        },
      }),
      db.booking.count({
        where: {
          bookedByEmployeeId: currentUser.id,
          status: "UPCOMING",
          startTime: { gt: now },
        },
      }),
      db.maintenanceRequest.count({
        where: {
          status: {
            in: [
              MaintenanceStatus.PENDING,
              MaintenanceStatus.APPROVED,
              MaintenanceStatus.TECHNICIAN_ASSIGNED,
              MaintenanceStatus.IN_PROGRESS,
            ],
          },
          raisedByEmployeeId: currentUser.id,
        },
      }),
    ]);

    kpis = {
      activeAllocations,
      pendingTransfers,
      upcomingBookings,
      activeMaintenance,
    };
  }

  // 2. Fetch Overdue Allocations based on role scope
  const overdueWhere: Prisma.AllocationWhereInput = {
    returnedAt: null,
    expectedReturnDate: { lt: now },
  };

  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    const deptId = employee?.departmentId || "";
    overdueWhere.OR = [
      { holderDepartmentId: deptId },
      { holderEmployee: { departmentId: deptId } },
    ];
  } else if (currentUser.role === Role.EMPLOYEE) {
    overdueWhere.holderEmployeeId = currentUser.id;
  }

  const overdue = await db.allocation.findMany({
    where: overdueWhere,
    include: {
      asset: { select: { id: true, name: true, assetTag: true } },
      holderEmployee: { select: { id: true, name: true, email: true } },
      holderDepartment: { select: { id: true, name: true } },
    },
    orderBy: { expectedReturnDate: "asc" },
  });

  // 3. Fetch Upcoming Bookings based on role scope
  const upcomingWhere: Prisma.BookingWhereInput = {
    status: "UPCOMING",
    startTime: { gt: now },
  };

  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    const deptId = employee?.departmentId || "";
    upcomingWhere.resourceAsset = {
      locationDepartmentId: deptId,
    };
  } else if (currentUser.role === Role.EMPLOYEE) {
    upcomingWhere.bookedByEmployeeId = currentUser.id;
  }

  const upcoming = await db.booking.findMany({
    where: upcomingWhere,
    include: {
      resourceAsset: { select: { id: true, name: true, assetTag: true } },
      bookedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
    take: 10,
  });

  return {
    kpis,
    overdue,
    upcoming,
  };
}
