export type Role = "EMPLOYEE" | "DEPARTMENT_HEAD" | "ASSET_MANAGER" | "ADMIN";

export type EmployeeStatus = "ACTIVE" | "INACTIVE";
export type DepartmentStatus = "ACTIVE" | "INACTIVE";
export type CategoryStatus = "ACTIVE" | "INACTIVE";
export type AssetStatus =
  | "AVAILABLE"
  | "ALLOCATED"
  | "RESERVED"
  | "UNDER_MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DISPOSED";
export type AllocationStatus = "ACTIVE" | "RETURNED";
export type TransferStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";
export type BookingStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface Employee {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  departmentId?: string;
  role: Role;
  status: EmployeeStatus;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  headEmployeeId?: string;
  parentDepartmentId?: string;
  status: DepartmentStatus;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  fieldSchema?: unknown;
  status: CategoryStatus;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  categoryId: string;
  serialNumber?: string;
  qrCode?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  condition?: string;
  locationDepartmentId?: string;
  status: AssetStatus;
  isBookable: boolean;
  photoUrls: string[];
  documentUrls: string[];
  categoryMetadata?: unknown;
}

export interface Allocation {
  id: string;
  assetId: string;
  holderEmployeeId?: string;
  holderDepartmentId?: string;
  allocatedAt: string;
  expectedReturnDate?: string;
  returnedAt?: string;
  conditionAtReturn?: string;
  status: AllocationStatus;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  currentAllocationId: string;
  requestedByEmployeeId: string;
  targetEmployeeId?: string;
  targetDepartmentId?: string;
  reason?: string;
  status: TransferStatus;
}

export interface Booking {
  id: string;
  resourceAssetId: string;
  bookedByEmployeeId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface CreateAssetInput {
  name: string;
  categoryId: string;
  locationDepartmentId?: string;
  serialNumber?: string;
  photoUrls?: string[];
}

export interface CreateAllocationInput {
  assetId: string;
  holderEmployeeId: string;
  expectedReturnDate?: string;
}

export interface CreateBookingInput {
  resourceAssetId: string;
  bookedByEmployeeId: string;
  startTime: string;
  endTime: string;
}

export interface UploadedFile {
  url: string;
  key: string;
}
