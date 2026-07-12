import { db } from "../../lib/db.js";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../../lib/errors.js";
import { Role, EmployeeStatus, Prisma } from "@prisma/client";

export async function listEmployees(
  filters: {
    departmentId?: string;
    role?: Role;
    status?: EmployeeStatus;
    search?: string;
  },
  currentUser: { id: string; role: Role },
) {
  const whereClause: Prisma.EmployeeWhereInput = {};

  // Role scoping: Admin & Asset Manager can see everything. Department Head is scoped to own department.
  if (currentUser.role === Role.DEPARTMENT_HEAD) {
    const employee = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    if (!employee || !employee.departmentId) {
      throw new ForbiddenError(
        "Department Head must be assigned to a department to view directory.",
      );
    }
    whereClause.departmentId = employee.departmentId;
  } else if (
    currentUser.role !== Role.ADMIN &&
    currentUser.role !== Role.ASSET_MANAGER
  ) {
    throw new ForbiddenError(
      "You do not have permission to view the employee directory.",
    );
  }

  // Apply filters
  if (filters.departmentId) {
    // If Dept Head, make sure they don't filter to someone else's department
    if (
      currentUser.role === Role.DEPARTMENT_HEAD &&
      filters.departmentId !== whereClause.departmentId
    ) {
      throw new ForbiddenError(
        "Department Head can only view employees in their own department.",
      );
    }
    whereClause.departmentId = filters.departmentId;
  }

  if (filters.role) {
    whereClause.role = filters.role;
  }

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.search) {
    whereClause.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.employee.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function updateEmployeeRole(id: string, targetRole: Role) {
  // ADMIN role is not assignable via the role-update endpoint (system-wide safeguard)
  if (targetRole === Role.ADMIN) {
    throw new BadRequestError(
      "The Admin role cannot be assigned via the employee update endpoint.",
    );
  }

  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) {
    throw new NotFoundError("Employee not found.");
  }

  if (employee.status !== EmployeeStatus.ACTIVE) {
    throw new BadRequestError("Cannot update role of an inactive employee.");
  }

  return db.employee.update({
    where: { id },
    data: { role: targetRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
    },
  });
}

export async function updateEmployeeStatus(
  id: string,
  targetStatus: EmployeeStatus,
) {
  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) {
    throw new NotFoundError("Employee not found.");
  }

  // Admin status check (cannot deactivate the last Admin)
  if (
    employee.role === Role.ADMIN &&
    targetStatus === EmployeeStatus.INACTIVE
  ) {
    const adminCount = await db.employee.count({
      where: { role: Role.ADMIN, status: EmployeeStatus.ACTIVE },
    });
    if (adminCount <= 1) {
      throw new BadRequestError(
        "Cannot deactivate the sole active Admin employee.",
      );
    }
  }

  return db.employee.update({
    where: { id },
    data: { status: targetStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
    },
  });
}

export async function assignEmployeeDepartment(
  id: string,
  departmentId: string | null,
) {
  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) {
    throw new NotFoundError("Employee not found.");
  }

  if (departmentId) {
    const dept = await db.department.findUnique({
      where: { id: departmentId },
    });
    if (!dept) {
      throw new NotFoundError("Department not found.");
    }
    if (dept.status !== "ACTIVE") {
      throw new BadRequestError(
        "Cannot assign employee to an inactive department.",
      );
    }
  }

  return db.employee.update({
    where: { id },
    data: { departmentId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
    },
  });
}
