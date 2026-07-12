import { apiAllocationsRepository } from "../providers/api/api-allocations.repository";
import { apiAssetsRepository } from "../providers/api/api-assets.repository";
import { apiBookingsRepository } from "../providers/api/api-bookings.repository";
import { apiOrgRepository } from "../providers/api/api-org.repository";
import { apiMaintenanceRepository } from "../providers/api/api-maintenance.repository";
import { apiAuditsRepository } from "../providers/api/api-audits.repository";

export function getAssetsRepository() {
  return apiAssetsRepository;
}

export function getOrgRepository() {
  return apiOrgRepository;
}

export function getAllocationsRepository() {
  return apiAllocationsRepository;
}

export function getBookingsRepository() {
  return apiBookingsRepository;
}

export function getMaintenanceRepository() {
  return apiMaintenanceRepository;
}

export function getAuditsRepository() {
  return apiAuditsRepository;
}
