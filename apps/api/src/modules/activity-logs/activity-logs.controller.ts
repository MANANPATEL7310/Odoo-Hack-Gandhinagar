import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk } from "../../lib/response.js";
import * as activityLogService from "./activity-logs.service.js";

export const listActivityLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const actorEmployeeId = req.query.actorEmployeeId as string | undefined;
    const targetEntityType = req.query.targetEntityType as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : undefined;

    const result = await activityLogService.listActivityLogs(
      { actorEmployeeId, targetEntityType, startDate, endDate, page, pageSize },
      { id: req.user!.sub, role: req.user!.role },
    );

    return sendOk(res, result, "Activity logs retrieved successfully.");
  },
);
