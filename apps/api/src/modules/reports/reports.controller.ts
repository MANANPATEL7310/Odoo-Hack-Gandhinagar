import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendError } from "../../lib/response.js";
import * as reportsService from "./reports.service.js";

export const getUtilizationReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const result = await reportsService.getUtilizationReport(
      { departmentId, categoryId },
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, result, "Utilization report retrieved successfully.");
  },
);

export const getMaintenanceFrequencyReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const result = await reportsService.getMaintenanceFrequencyReport(
      { departmentId, categoryId },
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(
      res,
      result,
      "Maintenance frequency report retrieved successfully.",
    );
  },
);

export const getRetirementForecastReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const result = await reportsService.getRetirementForecastReport(
      { departmentId, categoryId },
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(
      res,
      result,
      "Retirement forecast report retrieved successfully.",
    );
  },
);

export const getDepartmentAllocationReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const result = await reportsService.getDepartmentAllocationReport(
      { departmentId },
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(
      res,
      result,
      "Department allocation report retrieved successfully.",
    );
  },
);

export const getBookingHeatmapReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const result = await reportsService.getBookingHeatmapReport(
      { departmentId, categoryId },
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(
      res,
      result,
      "Booking heatmap report retrieved successfully.",
    );
  },
);

export const exportReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const { reportType } = req.params;
    const departmentId = req.query.departmentId as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const currentUser = { id: req.user!.sub, role: req.user!.role };

    let csvContent = "";
    const filename = `${reportType}_report.csv`;

    switch (reportType) {
      case "utilization": {
        const data = await reportsService.getUtilizationReport(
          { departmentId, categoryId },
          currentUser,
        );
        const headers = [
          "Category ID",
          "Category Name",
          "Total Assets",
          "Allocated Assets",
          "Utilization Rate (%)",
        ];
        const rows = data.map((item) => [
          item.categoryId,
          item.categoryName,
          item.totalAssets,
          item.allocatedAssets,
          item.utilizationRate,
        ]);
        csvContent = reportsService.generateCSV(headers, rows);
        break;
      }
      case "maintenance-frequency": {
        const data = await reportsService.getMaintenanceFrequencyReport(
          { departmentId, categoryId },
          currentUser,
        );
        const headers = [
          "Asset Tag",
          "Asset Name",
          "Total Requests",
          "Resolved Requests",
          "Avg Resolution Hours",
        ];
        const rows = data.map((item) => [
          item.assetTag,
          item.assetName,
          item.totalRequests,
          item.resolvedRequests,
          item.avgResolutionHours,
        ]);
        csvContent = reportsService.generateCSV(headers, rows);
        break;
      }
      case "retirement-forecast": {
        const data = await reportsService.getRetirementForecastReport(
          { departmentId, categoryId },
          currentUser,
        );
        const headers = [
          "Asset Tag",
          "Asset Name",
          "Category Name",
          "Acquisition Date",
          "Condition",
          "Age (Years)",
          "Status",
        ];
        const rows = data.map((item) => [
          item.assetTag,
          item.assetName,
          item.categoryName,
          item.acquisitionDate,
          item.condition,
          item.ageYears,
          item.status,
        ]);
        csvContent = reportsService.generateCSV(headers, rows);
        break;
      }
      case "department-allocation-summary": {
        const data = await reportsService.getDepartmentAllocationReport(
          { departmentId },
          currentUser,
        );
        const headers = [
          "Department ID",
          "Department Name",
          "Total Assets",
          "Allocated Assets",
          "Available Assets",
          "Maintenance Assets",
        ];
        const rows = data.map((item) => [
          item.departmentId,
          item.departmentName,
          item.totalAssets,
          item.allocatedAssets,
          item.availableAssets,
          item.maintenanceAssets,
        ]);
        csvContent = reportsService.generateCSV(headers, rows);
        break;
      }
      case "booking-heatmap": {
        const data = await reportsService.getBookingHeatmapReport(
          { departmentId, categoryId },
          currentUser,
        );
        const headers = [
          "Day of Week",
          "Booking Count",
          "Total Occupied Hours",
        ];
        const rows = data.map((item) => [
          item.dayName,
          item.bookingCount,
          item.totalHours,
        ]);
        csvContent = reportsService.generateCSV(headers, rows);
        break;
      }
      default:
        return sendError(res, 400, `Invalid report type: ${reportType}`);
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(csvContent);
  },
);
