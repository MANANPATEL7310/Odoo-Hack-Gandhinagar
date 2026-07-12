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
export type AuditStatus = "OPEN" | "CLOSED";
export type AuditItemStatus =
  | "UNVERIFIED"
  | "VERIFIED"
  | "MISSING"
  | "DAMAGED"
  | "UNRESOLVED";

export interface EntitySummary {
  id: string;
  name: string;
  email?: string;
  assetTag?: string;
  status?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId?: string;
  department?: Department;
  role: Role;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  headEmployeeId?: string;
  parentDepartmentId?: string;
  status: DepartmentStatus;
  head?: EntitySummary | null;
  parent?: EntitySummary | null;
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
  category?: AssetCategory | EntitySummary;
  location?: Department | EntitySummary | null;
  allocations?: Allocation[];
  maintenanceRequests?: MaintenanceRequest[];
  createdAt?: string;
  updatedAt?: string;
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
  asset?: Asset | EntitySummary;
  holderEmployee?: Employee | EntitySummary | null;
  holderDepartment?: Department | EntitySummary | null;
  createdAt?: string;
  updatedAt?: string;
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
  asset?: Asset | EntitySummary;
  requestedBy?: Employee | EntitySummary;
  targetEmployee?: Employee | EntitySummary | null;
  targetDepartment?: Department | EntitySummary | null;
  decidedByEmployeeId?: string;
  decidedBy?: Employee | EntitySummary | null;
  decidedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  resourceAssetId: string;
  bookedByEmployeeId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  resourceAsset?: Asset | EntitySummary;
  bookedBy?: Employee | EntitySummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  raisedByEmployeeId: string;
  issueDescription: string;
  priority: MaintenancePriority;
  photoUrl?: string;
  status: MaintenanceStatus;
  decidedByEmployeeId?: string;
  decidedAt?: string;
  rejectionReason?: string;
  technicianEmployeeId?: string;
  resolvedAt?: string;
  asset?: Asset | EntitySummary;
  raisedBy?: Employee | EntitySummary;
  decidedBy?: Employee | EntitySummary | null;
  technician?: Employee | EntitySummary | null;
  createdAt?: string;
  updatedAt?: string;
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
  holderEmployeeId?: string;
  holderDepartmentId?: string;
  expectedReturnDate?: string;
}

export interface CreateBookingInput {
  resourceAssetId: string;
  startTime: string;
  endTime: string;
}

export interface CreateMaintenanceRequestInput {
  assetId: string;
  issueDescription: string;
  priority: MaintenancePriority;
  photoUrl?: string;
}

export interface UploadedFile {
  url: string;
  key: string;
}

export interface AuditCycle {
  id: string;
  scopeDepartmentId?: string;
  scopeLocation?: string;
  createdByEmployeeId: string;
  startDate: string;
  endDate?: string;
  closedAt?: string;
  status: AuditStatus;
  scopeDepartment?: Department | EntitySummary | null;
  createdBy?: Employee | EntitySummary;
  auditors?: Array<{
    employeeId: string;
    employee: Employee | EntitySummary;
  }>;
  items?: Array<{
    status: AuditItemStatus;
  }>;
  _count?: {
    items: number;
  };
}

export interface CreateAuditCycleInput {
  scopeDepartmentId?: string;
  scopeLocation?: string;
  startDate: string;
  endDate: string;
  auditorEmployeeIds: string[];
}
