import { db } from "../../lib/db.js";
import {
  Role,
  AssetStatus,
  BookingStatus,
  MaintenanceStatus,
  TransferStatus,
  Prisma,
  AllocationStatus,
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
      assetsUnderMaintenance,
      activeMaintenanceRequests,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
    ] = await Promise.all([
      db.asset.count(),
      db.asset.count({ where: { status: AssetStatus.ALLOCATED } }),
      db.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
      db.asset.count({ where: { status: AssetStatus.UNDER_MAINTENANCE } }),
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
        },
      }),
      db.booking.count({ where: { status: BookingStatus.ONGOING } }),
      db.transferRequest.count({ where: { status: TransferStatus.REQUESTED } }),
      db.allocation.count({
        where: {
          status: AllocationStatus.ACTIVE,
          returnedAt: null,
          expectedReturnDate: { gte: now },
        },
      }),
    ]);

    kpis = {
      totalAssets,
      assetsAvailable: availableAssets,
      assetsAllocated: allocatedAssets,
      assetsUnderMaintenance,
      maintenanceToday: activeMaintenanceRequests,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
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
      assetsUnderMaintenance,
      activeAllocations,
      pendingTransfers,
      activeMaintenance,
      activeBookings,
      upcomingReturns,
    ] = await Promise.all([
      db.asset.count({ where: { locationDepartmentId: deptId } }),
      db.asset.count({
        where: {
          locationDepartmentId: deptId,
          status: AssetStatus.UNDER_MAINTENANCE,
        },
      }),
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
      db.booking.count({
        where: {
          status: BookingStatus.ONGOING,
          resourceAsset: { locationDepartmentId: deptId },
        },
      }),
      db.allocation.count({
        where: {
          status: AllocationStatus.ACTIVE,
          returnedAt: null,
          expectedReturnDate: { gte: now },
          OR: [
            { holderDepartmentId: deptId },
            { holderEmployee: { departmentId: deptId } },
          ],
        },
      }),
    ]);

    kpis = {
      totalAssets,
      assetsAvailable: Math.max(
        0,
        totalAssets - activeAllocations - assetsUnderMaintenance,
      ),
      assetsAllocated: activeAllocations,
      assetsUnderMaintenance,
      maintenanceToday: activeMaintenance,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
    };
  } else {
    // Employee Role
    const [
      activeAllocations,
      pendingTransfers,
      upcomingBookings,
      activeBookings,
      upcomingReturns,
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
      db.booking.count({
        where: {
          bookedByEmployeeId: currentUser.id,
          status: BookingStatus.ONGOING,
        },
      }),
      db.allocation.count({
        where: {
          holderEmployeeId: currentUser.id,
          status: AllocationStatus.ACTIVE,
          returnedAt: null,
          expectedReturnDate: { gte: now },
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
      totalAssets: activeAllocations,
      assetsAvailable: activeAllocations,
      assetsAllocated: activeAllocations,
      assetsUnderMaintenance: activeMaintenance,
      maintenanceToday: activeMaintenance,
      activeBookings,
      pendingTransfers,
      upcomingReturns: upcomingReturns + upcomingBookings,
    };
  }

  const totalAssets = kpis.totalAssets || 0;
  const unhealthyAssets = Math.min(
    kpis.assetsUnderMaintenance || 0,
    totalAssets,
  );
  kpis.assetHealthPercent = totalAssets
    ? Math.round(((totalAssets - unhealthyAssets) / totalAssets) * 100)
    : 0;

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
    upcomingReturns: upcoming,
    upcomingBookings: upcoming,
  };
}
