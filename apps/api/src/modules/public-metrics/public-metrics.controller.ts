import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk } from "../../lib/response.js";
import { getPublicMetrics } from "./public-metrics.service.js";

export const publicMetricsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const metrics = await getPublicMetrics();
    return sendOk(res, metrics, "Public metrics retrieved successfully.");
  },
);
