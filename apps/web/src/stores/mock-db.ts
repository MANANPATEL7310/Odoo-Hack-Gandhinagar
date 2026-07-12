import { create } from "zustand";

export type Role = "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE";
export type Status = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  status: Status;
}

export interface Department {
  id: string;
  name: string;
  headEmployeeId?: string;
  parentDepartmentId?: string;
  status: Status;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
}

export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Under Maintenance"
  | "Retired"
  | "Lost"
  | "Disposed";

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  categoryId: string;
  serialNumber?: string;
  status: AssetStatus;
  locationDepartmentId?: string;
  isBookable: boolean;
}

interface MockDB {
  users: User[];
  departments: Department[];
  assetCategories: AssetCategory[];
  assets: Asset[];
}

const initialDb: MockDB = {
  users: [
    {
      id: "u1",
      name: "Alice Admin",
      email: "alice@acme.com",
      role: "ADMIN",
      status: "Active",
    },
    {
      id: "u2",
      name: "Bob Asset Mgr",
      email: "bob@acme.com",
      role: "ASSET_MANAGER",
      status: "Active",
    },
    {
      id: "u3",
      name: "Charlie Dept Head",
      email: "charlie@acme.com",
      role: "DEPARTMENT_HEAD",
      departmentId: "d1",
      status: "Active",
    },
    {
      id: "u4",
      name: "Dave Employee",
      email: "dave@acme.com",
      role: "EMPLOYEE",
      departmentId: "d1",
      status: "Active",
    },
  ],
  departments: [
    { id: "d1", name: "Engineering", headEmployeeId: "u3", status: "Active" },
    { id: "d2", name: "HR", status: "Active" },
  ],
  assetCategories: [
    { id: "c1", name: "Laptops", description: "Standard issue laptops" },
    { id: "c2", name: "Projectors", description: "Meeting room projectors" },
  ],
  assets: [
    {
      id: "a1",
      assetTag: "AF-0001",
      name: "MacBook Pro 16",
      categoryId: "c1",
      status: "Allocated",
      locationDepartmentId: "d1",
      isBookable: false,
    },
    {
      id: "a2",
      assetTag: "AF-0002",
      name: "Dell XPS 15",
      categoryId: "c1",
      status: "Available",
      locationDepartmentId: "d1",
      isBookable: false,
    },
    {
      id: "a3",
      assetTag: "AF-0003",
      name: "Epson Projector X1",
      categoryId: "c2",
      status: "Available",
      isBookable: true,
    },
  ],
};

export const useMockDb = create<MockDB>(() => initialDb);
