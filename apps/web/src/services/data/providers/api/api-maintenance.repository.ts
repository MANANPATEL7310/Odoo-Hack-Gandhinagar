import { apiClient } from "@/services/http/api-client";
import {
  unwrapList,
  type ApiSuccess,
  type PaginatedData,
} from "@/services/http/api-response";
import { MaintenanceRepository } from "../../repositories/maintenance.repository";
import type {
  CreateMaintenanceRequestInput,
  MaintenanceRequest,
} from "../../types/domain";

export const apiMaintenanceRepository: MaintenanceRepository = {
  async listMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const response = await apiClient.get<
      ApiSuccess<MaintenanceRequest[] | PaginatedData<MaintenanceRequest>>
    >("/maintenance-requests", {
      params: { pageSize: 1000 },
    });
    return unwrapList(response.data.data);
  },

  async createMaintenanceRequest(
    payload: CreateMaintenanceRequestInput,
  ): Promise<MaintenanceRequest> {
    const response = await apiClient.post<ApiSuccess<MaintenanceRequest>>(
      "/maintenance-requests",
      payload,
    );
    return response.data.data;
  },

  async startWork(id: string): Promise<MaintenanceRequest> {
    const response = await apiClient.patch<ApiSuccess<MaintenanceRequest>>(
      `/maintenance-requests/${id}/start`,
    );
    return response.data.data;
  },

  async resolveIssue(id: string): Promise<MaintenanceRequest> {
    const response = await apiClient.patch<ApiSuccess<MaintenanceRequest>>(
      `/maintenance-requests/${id}/resolve`,
    );
    return response.data.data;
  },
};
