import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import * as departmentsService from "./departments.service.js";
import { DepartmentStatus } from "@prisma/client";

export const listDepartmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const statusQuery = req.query.status as string;
    let status: DepartmentStatus | undefined;
    if (statusQuery) {
      status =
        statusQuery.toUpperCase() === "ACTIVE"
          ? DepartmentStatus.ACTIVE
          : DepartmentStatus.INACTIVE;
    }

    const parentDeptId = req.query.parentDepartmentId as string | undefined;

    const list = await departmentsService.listDepartments({
      status,
      parentDepartmentId:
        parentDeptId !== undefined ? parentDeptId || null : undefined,
    });
    return sendOk(res, list, "Departments retrieved successfully.");
  },
);

export const createDepartmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const dept = await departmentsService.createDepartment(req.body);
    return sendCreated(res, dept, "Department created successfully.");
  },
);

export const updateDepartmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const dept = await departmentsService.updateDepartment(
      req.params.id as string,
      req.body,
    );
    return sendOk(res, dept, "Department updated successfully.");
  },
);

export const deactivateDepartmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const dept = await departmentsService.deactivateDepartment(
      req.params.id as string,
    );
    return sendOk(res, dept, "Department deactivated successfully.");
  },
);
