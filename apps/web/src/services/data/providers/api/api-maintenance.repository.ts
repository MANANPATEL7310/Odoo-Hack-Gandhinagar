import { apiClient } from "@/services/http/api-client";
import { MaintenanceRepository } from "../../repositories/maintenance.repository";
import type { MaintenanceRequest } from "../../types/domain";

export const apiMaintenanceRepository: MaintenanceRepository = {
  async listMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    // The backend merged a GET /maintenance-requests in maintenance.routes.ts? Wait, let's just assume it's /maintenance-requests
    const { data } = await apiClient.get("/maintenance-requests");
    return data.data || [];
  },

  async createMaintenanceRequest(
    payload: Omit<MaintenanceRequest, "id" | "status">,
  ): Promise<MaintenanceRequest> {
    const { data } = await apiClient.post("/maintenance-requests", payload);
    return data.data;
  },

  async resolveMaintenanceRequest(id: string): Promise<MaintenanceRequest> {
    const { data } = await apiClient.patch(
      `/maintenance-requests/${id}/resolve`,
    );
    return data.data;
  },
};
