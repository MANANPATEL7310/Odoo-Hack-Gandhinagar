import type { MaintenanceRequest } from "../types/domain";

export interface MaintenanceRepository {
  listMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(
    payload: Omit<MaintenanceRequest, "id" | "status">,
  ): Promise<MaintenanceRequest>;
  resolveMaintenanceRequest(id: string): Promise<MaintenanceRequest>;
}
