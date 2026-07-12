import type { AssetCategory, Department, Employee } from "../types/domain";

export interface OrgRepository {
  listDepartments(): Promise<Department[]>;
  listAssetCategories(): Promise<AssetCategory[]>;
  listEmployees(): Promise<Employee[]>;
}
