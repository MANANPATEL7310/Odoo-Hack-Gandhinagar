import type {
  CreateMaintenanceRequestInput,
  MaintenanceRequest,
} from "../types/domain";

export interface MaintenanceRepository {
  listMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(
    payload: CreateMaintenanceRequestInput,
  ): Promise<MaintenanceRequest>;
  startWork(id: string): Promise<MaintenanceRequest>;
  resolveIssue(id: string): Promise<MaintenanceRequest>;
}
