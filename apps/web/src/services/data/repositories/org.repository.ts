import type { AssetCategory, Department, Employee } from "../types/domain";

export interface CreateDepartmentInput {
  name: string;
  headEmployeeId?: string;
  parentDepartmentId?: string;
}

export interface CreateAssetCategoryInput {
  name: string;
  description?: string;
  fieldSchema?: Array<{
    name: string;
    type: "text" | "number" | "date";
    required?: boolean;
  }> | null;
}

export interface OrgRepository {
  listDepartments(): Promise<Department[]>;
  listAssetCategories(): Promise<AssetCategory[]>;
  listEmployees(): Promise<Employee[]>;
  createDepartment(payload: CreateDepartmentInput): Promise<Department>;
  createAssetCategory(
    payload: CreateAssetCategoryInput,
  ): Promise<AssetCategory>;
}
