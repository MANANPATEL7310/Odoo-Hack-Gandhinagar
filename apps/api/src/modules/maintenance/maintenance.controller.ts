import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import {
  createMaintenanceRequestSchema,
  approveMaintenanceRequestSchema,
  rejectMaintenanceRequestSchema,
} from "@template/shared";
import * as maintenanceService from "./maintenance.service.js";
import { MaintenanceStatus, MaintenancePriority } from "@prisma/client";

export const listMaintenanceRequestsController = asyncHandler(
  async (req: Request, res: Response) => {
    const statusQuery = req.query.status as string | undefined;
    let status: MaintenanceStatus | undefined;
    if (statusQuery) {
      status = statusQuery.toUpperCase() as MaintenanceStatus;
    }

    const priorityQuery = req.query.priority as string | undefined;
    let priority: MaintenancePriority | undefined;
    if (priorityQuery) {
      priority = priorityQuery.toUpperCase() as MaintenancePriority;
    }

    const assetId = req.query.assetId as string | undefined;
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : undefined;

    const result = await maintenanceService.listMaintenanceRequests(
      { status, priority, assetId, page, pageSize },
      { id: req.user!.sub, role: req.user!.role },
    );

    return sendOk(res, result, "Maintenance requests retrieved successfully.");
  },
);

export const createMaintenanceRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = createMaintenanceRequestSchema.parse(req.body);
    const request = await maintenanceService.createMaintenanceRequest(parsed, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    return sendCreated(
      res,
      request,
      "Maintenance request created successfully.",
    );
  },
);

export const approveMaintenanceRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = approveMaintenanceRequestSchema.parse(req.body);
    const request = await maintenanceService.approveMaintenanceRequest(
      req.params.id as string,
      parsed,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, request, "Maintenance request approved successfully.");
  },
);

export const rejectMaintenanceRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = rejectMaintenanceRequestSchema.parse(req.body);
    const request = await maintenanceService.rejectMaintenanceRequest(
      req.params.id as string,
      parsed,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, request, "Maintenance request rejected successfully.");
  },
);

export const assignTechnicianController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = approveMaintenanceRequestSchema.parse(req.body);
    const request = await maintenanceService.assignTechnician(
      req.params.id as string,
      parsed,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, request, "Technician assigned successfully.");
  },
);

export const startMaintenanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const request = await maintenanceService.startMaintenance(
      req.params.id as string,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, request, "Maintenance started successfully.");
  },
);

export const resolveMaintenanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const request = await maintenanceService.resolveMaintenance(
      req.params.id as string,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, request, "Maintenance resolved successfully.");
  },
);
