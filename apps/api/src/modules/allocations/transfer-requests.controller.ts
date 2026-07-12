import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import {
  transferAssetSchema,
  rejectTransferRequestSchema,
} from "@template/shared";
import * as transferService from "./transfer-requests.service.js";
import { TransferStatus } from "@prisma/client";

export const listTransferRequestsController = asyncHandler(
  async (req: Request, res: Response) => {
    const assetId = req.query.assetId as string | undefined;
    const statusQuery = req.query.status as string | undefined;
    let status: TransferStatus | undefined;
    if (statusQuery) {
      status = statusQuery.toUpperCase() as TransferStatus;
    }
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : undefined;

    const result = await transferService.listTransferRequests(
      { assetId, status, page, pageSize },
      { id: req.user!.sub, role: req.user!.role },
    );

    return sendOk(res, result, "Transfer requests retrieved successfully.");
  },
);

export const createTransferRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = transferAssetSchema.parse(req.body);
    const assetId = req.body.assetId as string;
    const request = await transferService.createTransferRequest(
      { ...parsed, assetId },
      { id: req.user!.sub, role: req.user!.role, name: req.user!.name },
    );
    return sendCreated(res, request, "Transfer request created successfully.");
  },
);

export const approveTransferRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const request = await transferService.approveTransferRequest(
      req.params.id as string,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, request, "Transfer request approved successfully.");
  },
);

export const rejectTransferRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = rejectTransferRequestSchema.parse(req.body);
    const request = await transferService.rejectTransferRequest(
      req.params.id as string,
      parsed,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, request, "Transfer request rejected successfully.");
  },
);
