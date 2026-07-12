import { apiClient } from "@/services/http/api-client";
import {
  unwrapList,
  type ApiSuccess,
  type PaginatedData,
} from "@/services/http/api-response";
import type { AuditCycle, CreateAuditCycleInput } from "../../types/domain";

export const apiAuditsRepository = {
  async listAuditCycles(): Promise<AuditCycle[]> {
    const response = await apiClient.get<
      ApiSuccess<AuditCycle[] | PaginatedData<AuditCycle>>
    >("/audit-cycles", {
      params: { pageSize: 1000 },
    });
    return unwrapList(response.data.data);
  },
  async createAuditCycle(payload: CreateAuditCycleInput): Promise<AuditCycle> {
    const response = await apiClient.post<ApiSuccess<AuditCycle>>(
      "/audit-cycles",
      payload,
    );
    return response.data.data;
  },
  async closeAuditCycle(id: string): Promise<AuditCycle> {
    const response = await apiClient.patch<
      ApiSuccess<{ data: AuditCycle; discrepancyReport: unknown }>
    >(`/audit-cycles/${id}/close`);
    return response.data.data.data;
  },
};
