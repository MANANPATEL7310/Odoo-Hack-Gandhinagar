import { db } from "../../lib/db.js";
import {
  ConflictError,
  BadRequestError,
  NotFoundError,
} from "../../lib/errors.js";
import { validateAcyclicHierarchy } from "../../lib/validation.js";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@template/shared";
import { DepartmentStatus } from "@prisma/client";

export async function listDepartments(filters: {
  status?: DepartmentStatus;
  parentDepartmentId?: string | null;
}) {
  return db.department.findMany({
    where: {
      status: filters.status,
      parentDepartmentId:
        filters.parentDepartmentId !== undefined
          ? filters.parentDepartmentId
          : undefined,
    },
    include: {
      head: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function createDepartment(input: CreateDepartmentInput) {
  // Check name uniqueness
  const existing = await db.department.findFirst({
    where: { name: { equals: input.name, mode: "insensitive" } },
  });
  if (existing) {
    throw new ConflictError("Department name already exists.");
  }

  // Validate circular dependency
  if (input.parentDepartmentId) {
    const isAcyclic = await validateAcyclicHierarchy(
      "",
      input.parentDepartmentId,
    );
    if (!isAcyclic) {
      throw new BadRequestError("Circular hierarchy detected.");
    }
  }

  // Validate head employee is active
  if (input.headEmployeeId) {
    const employee = await db.employee.findUnique({
      where: { id: input.headEmployeeId },
    });
    if (!employee) {
      throw new NotFoundError("Head employee not found.");
    }
    if (employee.status !== "ACTIVE") {
      throw new BadRequestError("Head employee must be active.");
    }
  }

  return db.department.create({
    data: {
      name: input.name,
      headEmployeeId: input.headEmployeeId || null,
      parentDepartmentId: input.parentDepartmentId || null,
      status: DepartmentStatus.ACTIVE,
    },
  });
}

export async function updateDepartment(
  id: string,
  input: UpdateDepartmentInput,
) {
  const dept = await db.department.findUnique({ where: { id } });
  if (!dept) {
    throw new NotFoundError("Department not found.");
  }

  // Check name uniqueness if changing name
  if (input.name && input.name.toLowerCase() !== dept.name.toLowerCase()) {
    const existing = await db.department.findFirst({
      where: { name: { equals: input.name, mode: "insensitive" } },
    });
    if (existing) {
      throw new ConflictError("Department name already exists.");
    }
  }

  // Validate parent hierarchy if updated
  if (input.parentDepartmentId !== undefined) {
    if (input.parentDepartmentId === id) {
      throw new BadRequestError("A department cannot be its own parent.");
    }
    if (input.parentDepartmentId) {
      const isAcyclic = await validateAcyclicHierarchy(
        id,
        input.parentDepartmentId,
      );
      if (!isAcyclic) {
        throw new BadRequestError("Circular hierarchy detected.");
      }
    }
  }

  // Validate head employee if updated
  if (input.headEmployeeId) {
    const employee = await db.employee.findUnique({
      where: { id: input.headEmployeeId },
    });
    if (!employee) {
      throw new NotFoundError("Head employee not found.");
    }
    if (employee.status !== "ACTIVE") {
      throw new BadRequestError("Head employee must be active.");
    }
  }

  const statusMapped =
    input.status === "ACTIVE"
      ? DepartmentStatus.ACTIVE
      : input.status === "INACTIVE"
        ? DepartmentStatus.INACTIVE
        : undefined;

  return db.department.update({
    where: { id },
    data: {
      name: input.name,
      headEmployeeId:
        input.headEmployeeId !== undefined ? input.headEmployeeId : undefined,
      parentDepartmentId:
        input.parentDepartmentId !== undefined
          ? input.parentDepartmentId
          : undefined,
      status: statusMapped,
    },
  });
}

export async function deactivateDepartment(id: string) {
  const dept = await db.department.findUnique({ where: { id } });
  if (!dept) {
    throw new NotFoundError("Department not found.");
  }

  return db.department.update({
    where: { id },
    data: { status: DepartmentStatus.INACTIVE },
  });
}
