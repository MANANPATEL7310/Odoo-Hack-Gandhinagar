import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import { allocateAssetSchema, returnAssetSchema } from "@template/shared";
import * as allocationsService from "./allocations.service.js";
import { AllocationStatus } from "@prisma/client";

export const listAllocationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const holderEmployeeId = req.query.holderEmployeeId as string | undefined;
    const holderDepartmentId = req.query.holderDepartmentId as
      | string
      | undefined;
    const assetId = req.query.assetId as string | undefined;
    const statusQuery = req.query.status as string | undefined;
    let status: AllocationStatus | undefined;
    if (statusQuery) {
      status =
        statusQuery.toUpperCase() === "ACTIVE"
          ? AllocationStatus.ACTIVE
          : AllocationStatus.RETURNED;
    }
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : undefined;

    const result = await allocationsService.listAllocations(
      { holderEmployeeId, holderDepartmentId, assetId, status, page, pageSize },
      { id: req.user!.sub, role: req.user!.role },
    );

    return sendOk(res, result, "Allocations retrieved successfully.");
  },
);

export const createAllocationController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = allocateAssetSchema.parse(req.body);
    const allocation = await allocationsService.createAllocation(parsed, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    return sendCreated(res, allocation, "Asset allocated successfully.");
  },
);

export const returnAllocationController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = returnAssetSchema.parse(req.body);
    const allocation = await allocationsService.returnAllocation(
      req.params.id as string,
      parsed,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, allocation, "Asset returned successfully.");
  },
);
