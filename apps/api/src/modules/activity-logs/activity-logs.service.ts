import { db } from "../../lib/db.js";
import { ForbiddenError } from "../../lib/errors.js";
import { Role, Prisma } from "@prisma/client";

export async function listActivityLogs(
  filters: {
    actorEmployeeId?: string;
    targetEntityType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  },
  currentUser: { id: string; role: Role },
) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.ActivityLogWhereInput = {};

  // Apply filters
  if (filters.actorEmployeeId) {
    whereClause.actorEmployeeId = filters.actorEmployeeId;
  }
  if (filters.targetEntityType) {
    whereClause.targetEntityType = filters.targetEntityType;
  }
  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }

  // Scoping rules:
  // Admin: Org-wide.
  // Department Head: Can see logs of employees in their department.
  // Employee: Can only see their own logs.
  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    if (!employee || !employee.departmentId) {
      throw new ForbiddenError("Department Head must belong to a department.");
    }
    const deptId = employee.departmentId;
    whereClause.actor = {
      departmentId: deptId,
    };
  } else if (currentUser.role === Role.EMPLOYEE) {
    whereClause.actorEmployeeId = currentUser.id;
  }

  const [logs, totalCount] = await Promise.all([
    db.activityLog.findMany({
      where: whereClause,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.activityLog.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: logs,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}
