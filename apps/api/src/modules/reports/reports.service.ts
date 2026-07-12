import { db } from "../../lib/db.js";
import { Role, AssetStatus, MaintenanceStatus, Prisma } from "@prisma/client";

async function getDeptIdForHead(currentUser: { id: string; role: Role }) {
  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    return employee?.departmentId || "restricted-none";
  }
  return null;
}

export async function getUtilizationReport(
  filters: { departmentId?: string; categoryId?: string },
  currentUser: { id: string; role: Role },
) {
  const headDeptId = await getDeptIdForHead(currentUser);
  const targetDeptId = headDeptId || filters.departmentId;

  // Build filter criteria
  const whereClause: Prisma.AssetWhereInput = {};
  if (targetDeptId) {
    whereClause.locationDepartmentId = targetDeptId;
  }
  if (filters.categoryId) {
    whereClause.categoryId = filters.categoryId;
  }

  // Fetch all categories
  const categories = await db.assetCategory.findMany({
    include: {
      assets: {
        where: whereClause,
        select: { status: true },
      },
    },
  });

  return categories.map((cat) => {
    const total = cat.assets.length;
    const allocated = cat.assets.filter(
      (a) => a.status === AssetStatus.ALLOCATED,
    ).length;
    const utilizationRate =
      total > 0 ? Math.round((allocated / total) * 100) : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      totalAssets: total,
      allocatedAssets: allocated,
      utilizationRate,
    };
  });
}

export async function getMaintenanceFrequencyReport(
  filters: { departmentId?: string; categoryId?: string },
  currentUser: { id: string; role: Role },
) {
  const headDeptId = await getDeptIdForHead(currentUser);
  const targetDeptId = headDeptId || filters.departmentId;

  const assetWhere: Prisma.AssetWhereInput = {};
  if (targetDeptId) {
    assetWhere.locationDepartmentId = targetDeptId;
  }
  if (filters.categoryId) {
    assetWhere.categoryId = filters.categoryId;
  }

  const whereClause: Prisma.MaintenanceRequestWhereInput = {};
  if (Object.keys(assetWhere).length > 0) {
    whereClause.asset = assetWhere;
  }

  const requests = await db.maintenanceRequest.findMany({
    where: whereClause,
    include: {
      asset: { select: { id: true, name: true, assetTag: true } },
    },
  });

  // Group by asset ID
  const grouped: Record<
    string,
    {
      assetTag: string;
      assetName: string;
      totalRequests: number;
      resolvedRequests: number;
      totalResolutionTimeMs: number;
    }
  > = {};

  for (const req of requests) {
    const assetId = req.assetId;
    if (!grouped[assetId]) {
      grouped[assetId] = {
        assetTag: req.asset.assetTag,
        assetName: req.asset.name,
        totalRequests: 0,
        resolvedRequests: 0,
        totalResolutionTimeMs: 0,
      };
    }

    grouped[assetId].totalRequests += 1;
    if (req.status === MaintenanceStatus.RESOLVED && req.resolvedAt) {
      grouped[assetId].resolvedRequests += 1;
      const duration =
        new Date(req.resolvedAt).getTime() - new Date(req.createdAt).getTime();
      grouped[assetId].totalResolutionTimeMs += duration;
    }
  }

  return Object.values(grouped).map((item) => {
    const avgResolutionHours =
      item.resolvedRequests > 0
        ? Math.round(
            (item.totalResolutionTimeMs /
              (1000 * 60 * 60 * item.resolvedRequests)) *
              10,
          ) / 10
        : 0;

    return {
      assetTag: item.assetTag,
      assetName: item.assetName,
      totalRequests: item.totalRequests,
      resolvedRequests: item.resolvedRequests,
      avgResolutionHours,
    };
  });
}

export async function getRetirementForecastReport(
  filters: { departmentId?: string; categoryId?: string },
  currentUser: { id: string; role: Role },
) {
  const headDeptId = await getDeptIdForHead(currentUser);
  const targetDeptId = headDeptId || filters.departmentId;

  const whereClause: Prisma.AssetWhereInput = {
    acquisitionDate: { not: null },
  };
  if (targetDeptId) {
    whereClause.locationDepartmentId = targetDeptId;
  }
  if (filters.categoryId) {
    whereClause.categoryId = filters.categoryId;
  }

  const assets = await db.asset.findMany({
    where: whereClause,
    include: {
      category: { select: { name: true } },
    },
    orderBy: { acquisitionDate: "asc" },
  });

  const now = new Date();
  return assets.map((asset) => {
    const acqDate = asset.acquisitionDate
      ? new Date(asset.acquisitionDate)
      : now;
    const ageYears =
      Math.round(
        ((now.getTime() - acqDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) *
          10,
      ) / 10;

    return {
      assetTag: asset.assetTag,
      assetName: asset.name,
      categoryName: asset.category.name,
      acquisitionDate: asset.acquisitionDate,
      condition: asset.condition || "Unknown",
      ageYears,
      status: asset.status,
    };
  });
}

export async function getDepartmentAllocationReport(
  filters: { departmentId?: string },
  currentUser: { id: string; role: Role },
) {
  const headDeptId = await getDeptIdForHead(currentUser);
  const targetDeptId = headDeptId || filters.departmentId;

  const whereClause: Prisma.DepartmentWhereInput = {};
  if (targetDeptId) {
    whereClause.id = targetDeptId;
  }

  const departments = await db.department.findMany({
    where: whereClause,
    include: {
      assets: {
        select: { status: true },
      },
    },
  });

  return departments.map((dept) => {
    const total = dept.assets.length;
    const allocated = dept.assets.filter(
      (a) => a.status === AssetStatus.ALLOCATED,
    ).length;
    const available = dept.assets.filter(
      (a) => a.status === AssetStatus.AVAILABLE,
    ).length;
    const maintenance = dept.assets.filter(
      (a) => a.status === AssetStatus.UNDER_MAINTENANCE,
    ).length;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      totalAssets: total,
      allocatedAssets: allocated,
      availableAssets: available,
      maintenanceAssets: maintenance,
    };
  });
}

export async function getBookingHeatmapReport(
  filters: { departmentId?: string; categoryId?: string },
  currentUser: { id: string; role: Role },
) {
  const headDeptId = await getDeptIdForHead(currentUser);
  const targetDeptId = headDeptId || filters.departmentId;

  const assetWhere: Prisma.AssetWhereInput = {};
  if (targetDeptId) {
    assetWhere.locationDepartmentId = targetDeptId;
  }
  if (filters.categoryId) {
    assetWhere.categoryId = filters.categoryId;
  }

  const whereClause: Prisma.BookingWhereInput = {};
  if (Object.keys(assetWhere).length > 0) {
    whereClause.resourceAsset = assetWhere;
  }

  const bookings = await db.booking.findMany({
    where: whereClause,
  });

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const heatmap: Record<
    string,
    { dayName: string; bookingCount: number; totalHours: number }
  > = {};

  // Initialize
  for (const day of daysOfWeek) {
    heatmap[day] = {
      dayName: day,
      bookingCount: 0,
      totalHours: 0,
    };
  }

  for (const booking of bookings) {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const dayName = daysOfWeek[start.getUTCDay()] || "Sunday";
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const dayData = heatmap[dayName];
    if (dayData) {
      dayData.bookingCount += 1;
      dayData.totalHours += Math.round(hours * 10) / 10;
    }
  }

  return Object.values(heatmap);
}

export function generateCSV(headers: string[], rows: unknown[][]): string {
  const csvLines = [headers.join(",")];
  for (const row of rows) {
    const cleanRow = row.map((cell) => {
      if (cell === null || cell === undefined) return '""';
      const cellString =
        cell instanceof Date ? cell.toISOString() : String(cell);
      // Escape quotes and wrap in quotes if contains comma
      const escaped = cellString.replace(/"/g, '""');
      return escaped.includes(",") ||
        escaped.includes('"') ||
        escaped.includes("\n")
        ? `"${escaped}"`
        : escaped;
    });
    csvLines.push(cleanRow.join(","));
  }
  return csvLines.join("\n");
}
