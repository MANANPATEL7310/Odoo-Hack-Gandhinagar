import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk } from "../../lib/response.js";
import { getDashboardData } from "./dashboard.service.js";

export const dashboardSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getDashboardData({
      id: req.user!.sub,
      role: req.user!.role,
    });

    return sendOk(res, result, "Dashboard summary retrieved successfully.");
  },
);
