import { apiClient } from "@/services/http/api-client";
import type { OrgRepository } from "@/services/data/repositories/org.repository";
import type {
  CreateAssetCategoryInput,
  CreateDepartmentInput,
} from "@/services/data/repositories/org.repository";
import type {
  AssetCategory,
  Department,
  Employee,
} from "@/services/data/types/domain";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

export const apiOrgRepository: OrgRepository = {
  async listDepartments() {
    const response =
      await apiClient.get<ApiSuccess<Department[]>>("/departments");
    return response.data.data;
  },

  async listAssetCategories() {
    const response =
      await apiClient.get<ApiSuccess<AssetCategory[]>>("/asset-categories");
    return response.data.data;
  },

  async listEmployees() {
    const response = await apiClient.get<ApiSuccess<Employee[]>>("/employees");
    return response.data.data;
  },

  async createDepartment(payload: CreateDepartmentInput) {
    const response = await apiClient.post<ApiSuccess<Department>>(
      "/departments",
      payload,
    );
    return response.data.data;
  },

  async createAssetCategory(payload: CreateAssetCategoryInput) {
    const response = await apiClient.post<ApiSuccess<AssetCategory>>(
      "/asset-categories",
      payload,
    );
    return response.data.data;
  },
};
