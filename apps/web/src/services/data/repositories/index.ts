import { env } from "@/config/env";
import type { AssetsRepository } from "./assets.repository";
import type { AllocationsRepository } from "./allocations.repository";
import type { BookingsRepository } from "./bookings.repository";
import type { OrgRepository } from "./org.repository";
import { apiAllocationsRepository } from "../providers/api/api-allocations.repository";
import { apiAssetsRepository } from "../providers/api/api-assets.repository";
import { apiBookingsRepository } from "../providers/api/api-bookings.repository";
import { apiOrgRepository } from "../providers/api/api-org.repository";
import { mockAllocationsRepository } from "../providers/mock/mock-allocations.repository";
import { mockAssetsRepository } from "../providers/mock/mock-assets.repository";
import { mockBookingsRepository } from "../providers/mock/mock-bookings.repository";
import { mockOrgRepository } from "../providers/mock/mock-org.repository";

const assetsRepository: AssetsRepository = env.VITE_USE_MOCK_DATA
  ? mockAssetsRepository
  : apiAssetsRepository;

const orgRepository: OrgRepository = env.VITE_USE_MOCK_DATA
  ? mockOrgRepository
  : apiOrgRepository;

const allocationsRepository: AllocationsRepository = env.VITE_USE_MOCK_DATA
  ? mockAllocationsRepository
  : apiAllocationsRepository;

const bookingsRepository: BookingsRepository = env.VITE_USE_MOCK_DATA
  ? mockBookingsRepository
  : apiBookingsRepository;

export function getAssetsRepository() {
  return assetsRepository;
}

export function getOrgRepository() {
  return orgRepository;
}

export function getAllocationsRepository() {
  return allocationsRepository;
}

export function getBookingsRepository() {
  return bookingsRepository;
}
