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
export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MaintenanceStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "TECHNICIAN_ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

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
  fieldSchema?: Record<string, unknown>;
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
  categoryMetadata?: Record<string, unknown>;
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

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  raisedByEmployeeId: string;
  issueDescription: string;
  priority: MaintenancePriority;
  photoUrl?: string;
  status: MaintenanceStatus;
  technicianEmployeeId?: string;
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

export interface AuditCycle {
  id: string;
  scopeDepartmentId?: string;
  createdByEmployeeId: string;
  startDate: string;
  status: "OPEN" | "CLOSED";
}
