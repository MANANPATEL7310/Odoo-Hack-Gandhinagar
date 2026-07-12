import { useMockDb } from "@/stores/mock-db";
import type { AssetsRepository } from "@/services/data/repositories/assets.repository";
import type {
  Asset,
  AssetCategory,
  Department,
  UploadedFile,
} from "@/services/data/types/domain";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function nextAssetTag(assets: Asset[]): string {
  let maxNumber = 0;

  for (const asset of assets) {
    const match = asset.assetTag.match(/AF-(\d+)/);
    if (!match) continue;

    const numeric = Number(match[1]);
    if (!Number.isNaN(numeric)) {
      maxNumber = Math.max(maxNumber, numeric);
    }
  }

  return `AF-${String(maxNumber + 1).padStart(4, "0")}`;
}

export const mockAssetsRepository: AssetsRepository = {
  async listAssets() {
    await delay(250);
    return useMockDb.getState().assets;
  },

  async listAssetCategories() {
    await delay(120);
    return useMockDb.getState().assetCategories as AssetCategory[];
  },

  async listDepartments() {
    await delay(120);
    return useMockDb.getState().departments as Department[];
  },

  async createAsset(payload) {
    await delay(300);

    const db = useMockDb.getState();
    const now = new Date().toISOString();

    const newAsset: Asset = {
      id: `a-${Date.now()}`,
      assetTag: nextAssetTag(db.assets as Asset[]),
      name: payload.name,
      categoryId: payload.categoryId,
      serialNumber: payload.serialNumber,
      locationDepartmentId: payload.locationDepartmentId,
      status: "AVAILABLE",
      isBookable: false,
      photoUrls: payload.photoUrls ?? [],
      documentUrls: [],
      acquisitionDate: now,
    };

    useMockDb.setState((state) => ({
      ...state,
      assets: [newAsset, ...state.assets],
    }));

    return newAsset;
  },

  async uploadFile(file) {
    await delay(200);

    return {
      url: URL.createObjectURL(file),
      key: `mock-upload-${Date.now()}`,
    } satisfies UploadedFile;
  },
};
