import type {
  Allocation,
  Asset,
  CreateAllocationInput,
  Department,
  Employee,
  TransferRequest,
} from "../types/domain";

export interface AllocationsRepository {
  listAllocations(): Promise<Allocation[]>;
  listTransferRequests(): Promise<TransferRequest[]>;
  listAssets(): Promise<Asset[]>;
  listEmployees(): Promise<Employee[]>;
  listDepartments(): Promise<Department[]>;
  createAllocation(payload: CreateAllocationInput): Promise<Allocation>;
  returnAllocation(
    allocationId: string,
    conditionAtReturn: string,
  ): Promise<Allocation>;
  approveTransferRequest(transferRequestId: string): Promise<TransferRequest>;
  rejectTransferRequest(transferRequestId: string): Promise<TransferRequest>;
}
