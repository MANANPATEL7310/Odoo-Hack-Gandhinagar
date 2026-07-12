import { apiClient } from "@/services/http/api-client";
import {
  unwrapList,
  type ApiSuccess,
  type PaginatedData,
} from "@/services/http/api-response";
import type { AssetsRepository } from "@/services/data/repositories/assets.repository";
import type {
  Asset,
  AssetCategory,
  Department,
  UploadedFile,
} from "@/services/data/types/domain";

export const apiAssetsRepository: AssetsRepository = {
  async listAssets() {
    const response = await apiClient.get<
      ApiSuccess<Asset[] | PaginatedData<Asset>>
    >("/assets", {
      params: { pageSize: 1000 },
    });
    return unwrapList(response.data.data);
  },

  async getAsset(assetId) {
    const response = await apiClient.get<ApiSuccess<Asset>>(
      `/assets/${assetId}`,
    );
    return response.data.data;
  },

  async listAssetCategories() {
    const response =
      await apiClient.get<ApiSuccess<AssetCategory[]>>("/asset-categories");
    return response.data.data;
  },

  async listDepartments() {
    const response =
      await apiClient.get<ApiSuccess<Department[]>>("/departments");
    return response.data.data;
  },

  async createAsset(payload) {
    const response = await apiClient.post<ApiSuccess<Asset>>(
      "/assets",
      payload,
    );
    return response.data.data;
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiSuccess<UploadedFile>>(
      "/uploads",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data.data;
  },
};
