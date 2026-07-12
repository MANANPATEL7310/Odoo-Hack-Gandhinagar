import { create } from "zustand";

// --- Enums matched to Prisma Schema ---
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

// --- Models matched to Prisma Schema ---
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

export interface AuditCycle {
  id: string;
  scopeDepartmentId?: string;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  createdByEmployeeId: string;
}

export interface AuditCycleItem {
  id: string;
  auditCycleId: string;
  assetId: string;
  status: AuditItemStatus;
  markedByEmployeeId?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  recipientEmployeeId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorEmployeeId: string;
  action: string;
  targetEntityType: string;
  targetEntityId: string;
  createdAt: string;
}

interface MockDB {
  users: Employee[]; // aliased as users for ease
  departments: Department[];
  assetCategories: AssetCategory[];
  assets: Asset[];
  allocations: Allocation[];
  transferRequests: TransferRequest[];
  bookings: Booking[];
  maintenanceRequests: MaintenanceRequest[];
  auditCycles: AuditCycle[];
  auditItems: AuditCycleItem[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
}

const initialDb: MockDB = {
  users: [
    {
      id: "u1",
      name: "Alice Admin",
      email: "alice@acme.com",
      passwordHash: "hash",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u2",
      name: "Bob Asset Mgr",
      email: "bob@acme.com",
      passwordHash: "hash",
      role: "ASSET_MANAGER",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u3",
      name: "Charlie Dept Head",
      email: "charlie@acme.com",
      passwordHash: "hash",
      departmentId: "d1",
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u4",
      name: "Dave Employee",
      email: "dave@acme.com",
      passwordHash: "hash",
      departmentId: "d1",
      role: "EMPLOYEE",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
  ],
  departments: [
    { id: "d1", name: "Engineering", headEmployeeId: "u3", status: "ACTIVE" },
    { id: "d2", name: "HR", status: "ACTIVE" },
    { id: "d3", name: "Marketing", parentDepartmentId: "d1", status: "ACTIVE" },
  ],
  assetCategories: [
    {
      id: "c1",
      name: "Laptops",
      description: "Standard issue laptops",
      status: "ACTIVE",
    },
    {
      id: "c2",
      name: "Projectors",
      description: "Meeting room projectors",
      status: "ACTIVE",
    },
    {
      id: "c3",
      name: "Monitors",
      description: "Desk monitors",
      status: "ACTIVE",
    },
  ],
  assets: [
    {
      id: "a1",
      assetTag: "AF-0001",
      name: "MacBook Pro 16",
      categoryId: "c1",
      status: "ALLOCATED",
      locationDepartmentId: "d1",
      isBookable: false,
      photoUrls: [],
      documentUrls: [],
    },
    {
      id: "a2",
      assetTag: "AF-0002",
      name: "Dell XPS 15",
      categoryId: "c1",
      status: "AVAILABLE",
      locationDepartmentId: "d1",
      isBookable: false,
      photoUrls: [],
      documentUrls: [],
    },
    {
      id: "a3",
      assetTag: "AF-0003",
      name: "Epson Projector X1",
      categoryId: "c2",
      status: "AVAILABLE",
      isBookable: true,
      photoUrls: [],
      documentUrls: [],
    },
    {
      id: "a4",
      assetTag: "AF-0004",
      name: "LG 27 inch 4K",
      categoryId: "c3",
      status: "UNDER_MAINTENANCE",
      isBookable: false,
      photoUrls: [],
      documentUrls: [],
    },
    {
      id: "a5",
      assetTag: "AF-0005",
      name: "Conference Camera",
      categoryId: "c2",
      status: "RESERVED",
      isBookable: true,
      photoUrls: [],
      documentUrls: [],
    },
    {
      id: "a6",
      assetTag: "AF-0006",
      name: "ThinkPad T14",
      categoryId: "c1",
      status: "RETIRED",
      isBookable: false,
      photoUrls: [],
      documentUrls: [],
    },
  ],
  allocations: [
    {
      id: "al1",
      assetId: "a1",
      holderEmployeeId: "u4",
      allocatedAt: new Date().toISOString(),
      status: "ACTIVE",
    },
  ],
  transferRequests: [
    {
      id: "tr1",
      assetId: "a1",
      currentAllocationId: "al1",
      requestedByEmployeeId: "u4",
      targetDepartmentId: "d2",
      status: "REQUESTED",
    },
  ],
  bookings: [
    {
      id: "b1",
      resourceAssetId: "a3",
      bookedByEmployeeId: "u4",
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
      status: "UPCOMING",
    },
  ],
  maintenanceRequests: [
    {
      id: "mr1",
      assetId: "a4",
      raisedByEmployeeId: "u4",
      issueDescription: "Screen flickering",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      technicianEmployeeId: "u2",
    },
  ],
  auditCycles: [
    {
      id: "ac1",
      scopeDepartmentId: "d1",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: "OPEN",
      createdByEmployeeId: "u1",
    },
  ],
  auditItems: [
    {
      id: "ai1",
      auditCycleId: "ac1",
      assetId: "a1",
      status: "VERIFIED",
      markedByEmployeeId: "u3",
    },
    {
      id: "ai2",
      auditCycleId: "ac1",
      assetId: "a2",
      status: "UNVERIFIED",
    },
  ],
  notifications: [
    {
      id: "n1",
      recipientEmployeeId: "u4",
      type: "booking",
      message: "Your booking for Epson Projector X1 is upcoming.",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
  activityLogs: [
    {
      id: "log1",
      actorEmployeeId: "u4",
      action: "BOOKING_CREATED",
      targetEntityType: "Booking",
      targetEntityId: "b1",
      createdAt: new Date().toISOString(),
    },
  ],
};

export const useMockDb = create<MockDB>(() => initialDb);
