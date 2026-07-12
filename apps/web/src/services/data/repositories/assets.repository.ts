import type {
  Asset,
  AssetCategory,
  CreateAssetInput,
  Department,
  UploadedFile,
} from "../types/domain";

export interface AssetsRepository {
  listAssets(): Promise<Asset[]>;
  getAsset(assetId: string): Promise<Asset>;
  listAssetCategories(): Promise<AssetCategory[]>;
  listDepartments(): Promise<Department[]>;
  createAsset(payload: CreateAssetInput): Promise<Asset>;
  uploadFile(file: File): Promise<UploadedFile>;
}
