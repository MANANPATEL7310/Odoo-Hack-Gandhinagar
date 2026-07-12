import { useMockDb } from "@/stores/mock-db";
import type { OrgRepository } from "@/services/data/repositories/org.repository";
import type {
  AssetCategory,
  Department,
  Employee,
} from "@/services/data/types/domain";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockOrgRepository: OrgRepository = {
  async listDepartments() {
    await delay(150);
    return useMockDb.getState().departments as Department[];
  },

  async listAssetCategories() {
    await delay(150);
    return useMockDb.getState().assetCategories as AssetCategory[];
  },

  async listEmployees() {
    await delay(150);
    return useMockDb.getState().users as Employee[];
  },
};
