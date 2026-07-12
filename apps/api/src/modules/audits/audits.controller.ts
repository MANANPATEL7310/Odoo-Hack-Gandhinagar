import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import { createAuditCycleSchema, markAuditItemSchema } from "@template/shared";
import * as auditsService from "./audits.service.js";
import { AuditStatus } from "@prisma/client";

export const listAuditCyclesController = asyncHandler(
  async (req: Request, res: Response) => {
    const statusQuery = req.query.status as string | undefined;
    let status: AuditStatus | undefined;
    if (statusQuery) {
      status = statusQuery.toUpperCase() as AuditStatus;
    }

    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : undefined;

    const result = await auditsService.listAuditCycles(
      { status, page, pageSize },
      { id: req.user!.sub, role: req.user!.role },
    );

    return sendOk(res, result, "Audit cycles retrieved successfully.");
  },
);

export const getAuditCycleController = asyncHandler(
  async (req: Request, res: Response) => {
    const cycle = await auditsService.getAuditCycle(req.params.id as string, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    return sendOk(res, cycle, "Audit cycle retrieved successfully.");
  },
);

export const createAuditCycleController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = createAuditCycleSchema.parse(req.body);
    const cycle = await auditsService.createAuditCycle(parsed, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    return sendCreated(res, cycle, "Audit cycle created successfully.");
  },
);

export const markAuditItemController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = markAuditItemSchema.parse(req.body);
    const item = await auditsService.markAuditItem(
      req.params.id as string,
      parsed,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, item, "Audit item marked successfully.");
  },
);

export const closeAuditCycleController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await auditsService.closeAuditCycle(
      req.params.id as string,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, result, "Audit cycle closed successfully.");
  },
);
