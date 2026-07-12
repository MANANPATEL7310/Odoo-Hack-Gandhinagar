import { db } from "../../lib/db.js";
import {
  AllocationStatus,
  AssetStatus,
  AuditStatus,
  BookingStatus,
  MaintenanceStatus,
} from "@prisma/client";

export async function getPublicMetrics() {
  const [
    totalAssets,
    allocatedAssets,
    assetsUnderMaintenance,
    activeDepartments,
    activeEmployees,
    activeBookings,
    activeMaintenanceRequests,
    openAuditCycles,
    activityLogCount,
  ] = await Promise.all([
    db.asset.count(),
    db.allocation.count({
      where: { status: AllocationStatus.ACTIVE, returnedAt: null },
    }),
    db.asset.count({ where: { status: AssetStatus.UNDER_MAINTENANCE } }),
    db.department.count({ where: { status: "ACTIVE" } }),
    db.employee.count({ where: { status: "ACTIVE" } }),
    db.booking.count({
      where: {
        status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
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
      },
    }),
    db.auditCycle.count({ where: { status: AuditStatus.OPEN } }),
    db.activityLog.count(),
  ]);

  const assetHealthPercent = totalAssets
    ? Math.round(
        ((totalAssets - Math.min(assetsUnderMaintenance, totalAssets)) /
          totalAssets) *
          100,
      )
    : 0;

  return {
    totalAssets,
    allocatedAssets,
    assetsUnderMaintenance,
    activeDepartments,
    activeEmployees,
    activeBookings,
    activeMaintenanceRequests,
    openAuditCycles,
    activityLogCount,
    assetHealthPercent,
  };
}
