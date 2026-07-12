import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import * as assetsService from "./assets.service.js";
import { AssetStatus } from "@prisma/client";

export const listAssetsController = asyncHandler(
  async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const categoryId = req.query.category as string | undefined;
    const statusQuery = req.query.status as string | undefined;
    let status: AssetStatus | undefined;
    if (statusQuery) {
      status = statusQuery.toUpperCase() as AssetStatus;
    }
    const departmentId = req.query.department as string | undefined;
    const isBookable =
      req.query.isBookable !== undefined
        ? req.query.isBookable === "true"
        : undefined;
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : undefined;

    const result = await assetsService.listAssets(
      { search, categoryId, status, departmentId, isBookable, page, pageSize },
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, result, "Assets retrieved successfully.");
  },
);

export const getAssetByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const asset = await assetsService.getAssetById(req.params.id as string);
    return sendOk(res, asset, "Asset details retrieved successfully.");
  },
);

export const createAssetController = asyncHandler(
  async (req: Request, res: Response) => {
    const asset = await assetsService.createAsset(req.body);
    return sendCreated(res, asset, "Asset registered successfully.");
  },
);

export const updateAssetController = asyncHandler(
  async (req: Request, res: Response) => {
    const asset = await assetsService.updateAsset(
      req.params.id as string,
      req.body,
    );
    return sendOk(res, asset, "Asset updated successfully.");
  },
);

export const retireAssetController = asyncHandler(
  async (req: Request, res: Response) => {
    const asset = await assetsService.retireAsset(req.params.id as string);
    return sendOk(res, asset, "Asset retired successfully.");
  },
);

export const disposeAssetController = asyncHandler(
  async (req: Request, res: Response) => {
    const asset = await assetsService.disposeAsset(req.params.id as string);
    return sendOk(res, asset, "Asset disposed successfully.");
  },
);
