import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk } from "../../lib/response.js";
import * as employeesService from "./employees.service.js";
import { Role, EmployeeStatus } from "@prisma/client";

export const listEmployeesController = asyncHandler(
  async (req: Request, res: Response) => {
    const departmentId = req.query.department as string | undefined;
    const role = req.query.role as Role | undefined;
    const statusQuery = req.query.status as string | undefined;
    let status: EmployeeStatus | undefined;
    if (statusQuery) {
      status =
        statusQuery.toUpperCase() === "ACTIVE"
          ? EmployeeStatus.ACTIVE
          : EmployeeStatus.INACTIVE;
    }
    const search = req.query.search as string | undefined;

    const list = await employeesService.listEmployees(
      { departmentId, role, status, search },
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, list, "Employee directory retrieved successfully.");
  },
);

export const updateEmployeeRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const role = req.body.role as Role;
    const updated = await employeesService.updateEmployeeRole(
      req.params.id as string,
      role,
    );
    return sendOk(res, updated, "Employee role updated successfully.");
  },
);

export const updateEmployeeStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const statusInput = req.body.status as string;
    const status =
      statusInput.toUpperCase() === "ACTIVE"
        ? EmployeeStatus.ACTIVE
        : EmployeeStatus.INACTIVE;

    const updated = await employeesService.updateEmployeeStatus(
      req.params.id as string,
      status,
    );
    return sendOk(res, updated, "Employee status updated successfully.");
  },
);

export const assignEmployeeDepartmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const deptId = req.body.departmentId as string | null | undefined;
    const updated = await employeesService.assignEmployeeDepartment(
      req.params.id as string,
      deptId || null,
    );
    return sendOk(res, updated, "Employee department assigned successfully.");
  },
);
