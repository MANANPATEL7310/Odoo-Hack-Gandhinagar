import { apiClient } from "@/services/http/api-client";
import type { AuditCycle } from "../../types/domain";

export const apiAuditsRepository = {
  async listAuditCycles(): Promise<AuditCycle[]> {
    const { data } = await apiClient.get("/audit-cycles");
    return data.data || [];
  },
  async createAuditCycle(
    payload: Omit<AuditCycle, "id" | "status">,
  ): Promise<AuditCycle> {
    const { data } = await apiClient.post("/audit-cycles", payload);
    return data.data;
  },
  async closeAuditCycle(id: string): Promise<AuditCycle> {
    const { data } = await apiClient.patch(`/audit-cycles/${id}/close`);
    return data.data;
  },
};
