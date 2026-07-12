import { apiClient } from "@/services/http/api-client";
import {
  unwrapList,
  type ApiSuccess,
  type PaginatedData,
} from "@/services/http/api-response";
import type { AllocationsRepository } from "@/services/data/repositories/allocations.repository";
import type {
  Allocation,
  Asset,
  CreateAllocationInput,
  Department,
  Employee,
  TransferRequest,
} from "@/services/data/types/domain";

export const apiAllocationsRepository: AllocationsRepository = {
  async listAllocations() {
    const response = await apiClient.get<
      ApiSuccess<Allocation[] | PaginatedData<Allocation>>
    >("/allocations", {
      params: { pageSize: 1000 },
    });
    return unwrapList(response.data.data);
  },

  async listTransferRequests() {
    const response = await apiClient.get<
      ApiSuccess<TransferRequest[] | PaginatedData<TransferRequest>>
    >("/transfer-requests", {
      params: { pageSize: 1000 },
    });
    return unwrapList(response.data.data);
  },

  async listAssets() {
    const response = await apiClient.get<
      ApiSuccess<Asset[] | PaginatedData<Asset>>
    >("/assets", {
      params: { pageSize: 1000 },
    });
    return unwrapList(response.data.data);
  },

  async listEmployees() {
    const response = await apiClient.get<ApiSuccess<Employee[]>>("/employees");
    return response.data.data;
  },

  async listDepartments() {
    const response =
      await apiClient.get<ApiSuccess<Department[]>>("/departments");
    return response.data.data;
  },

  async createAllocation(payload: CreateAllocationInput) {
    const response = await apiClient.post<ApiSuccess<Allocation>>(
      "/allocations",
      payload,
    );
    return response.data.data;
  },

  async returnAllocation(allocationId: string, conditionAtReturn: string) {
    const response = await apiClient.patch<ApiSuccess<Allocation>>(
      `/allocations/${allocationId}/return`,
      { conditionAtReturn },
    );
    return response.data.data;
  },

  async approveTransferRequest(transferRequestId: string) {
    const response = await apiClient.patch<ApiSuccess<TransferRequest>>(
      `/transfer-requests/${transferRequestId}/approve`,
    );
    return response.data.data;
  },

  async rejectTransferRequest(transferRequestId: string) {
    const response = await apiClient.patch<ApiSuccess<TransferRequest>>(
      `/transfer-requests/${transferRequestId}/reject`,
      { reason: "Rejected by reviewer" },
    );
    return response.data.data;
  },
};
