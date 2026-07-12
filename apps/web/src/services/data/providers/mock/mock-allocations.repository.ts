import { useMockDb } from "@/stores/mock-db";
import type { AllocationsRepository } from "@/services/data/repositories/allocations.repository";
import type {
  Allocation,
  CreateAllocationInput,
  TransferRequest,
} from "@/services/data/types/domain";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAllocationsRepository: AllocationsRepository = {
  async listAllocations() {
    await delay(150);
    return useMockDb.getState().allocations;
  },

  async listTransferRequests() {
    await delay(150);
    return useMockDb.getState().transferRequests;
  },

  async listAssets() {
    await delay(120);
    return useMockDb.getState().assets;
  },

  async listEmployees() {
    await delay(120);
    return useMockDb.getState().users;
  },

  async listDepartments() {
    await delay(120);
    return useMockDb.getState().departments;
  },

  async createAllocation(payload: CreateAllocationInput) {
    await delay(180);

    const now = new Date().toISOString();
    const newAllocation: Allocation = {
      id: `al-${Date.now()}`,
      assetId: payload.assetId,
      holderEmployeeId: payload.holderEmployeeId,
      allocatedAt: now,
      expectedReturnDate: payload.expectedReturnDate,
      status: "ACTIVE",
    };

    useMockDb.setState((state) => ({
      ...state,
      allocations: [newAllocation, ...state.allocations],
      assets: state.assets.map((asset) =>
        asset.id === payload.assetId
          ? { ...asset, status: "ALLOCATED" }
          : asset,
      ),
    }));

    return newAllocation;
  },

  async returnAllocation(allocationId: string) {
    await delay(180);

    const state = useMockDb.getState();
    const allocation = state.allocations.find(
      (item) => item.id === allocationId,
    );

    if (!allocation) {
      throw new Error("Allocation not found");
    }

    const now = new Date().toISOString();
    const updated: Allocation = {
      ...allocation,
      returnedAt: now,
      status: "RETURNED",
    };

    useMockDb.setState((prev) => ({
      ...prev,
      allocations: prev.allocations.map((item) =>
        item.id === allocationId ? updated : item,
      ),
      assets: prev.assets.map((asset) =>
        asset.id === allocation.assetId
          ? { ...asset, status: "AVAILABLE" }
          : asset,
      ),
    }));

    return updated;
  },

  async approveTransferRequest(transferRequestId: string) {
    await delay(180);

    const state = useMockDb.getState();
    const request = state.transferRequests.find(
      (item) => item.id === transferRequestId,
    );

    if (!request) {
      throw new Error("Transfer request not found");
    }

    const updated: TransferRequest = {
      ...request,
      status: "APPROVED",
    };

    useMockDb.setState((prev) => ({
      ...prev,
      transferRequests: prev.transferRequests.map((item) =>
        item.id === transferRequestId ? updated : item,
      ),
    }));

    return updated;
  },

  async rejectTransferRequest(transferRequestId: string) {
    await delay(180);

    const state = useMockDb.getState();
    const request = state.transferRequests.find(
      (item) => item.id === transferRequestId,
    );

    if (!request) {
      throw new Error("Transfer request not found");
    }

    const updated: TransferRequest = {
      ...request,
      status: "REJECTED",
    };

    useMockDb.setState((prev) => ({
      ...prev,
      transferRequests: prev.transferRequests.map((item) =>
        item.id === transferRequestId ? updated : item,
      ),
    }));

    return updated;
  },
};
