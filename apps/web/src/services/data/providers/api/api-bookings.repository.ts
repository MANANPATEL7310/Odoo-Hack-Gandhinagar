import { apiClient } from "@/services/http/api-client";
import type { BookingsRepository } from "@/services/data/repositories/bookings.repository";
import type {
  Asset,
  Booking,
  CreateBookingInput,
  Employee,
} from "@/services/data/types/domain";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

export const apiBookingsRepository: BookingsRepository = {
  async listBookings() {
    const response = await apiClient.get<ApiSuccess<Booking[]>>("/bookings");
    return response.data.data;
  },

  async listAssets() {
    const response = await apiClient.get<ApiSuccess<Asset[]>>("/assets");
    return response.data.data;
  },

  async listEmployees() {
    const response = await apiClient.get<ApiSuccess<Employee[]>>("/employees");
    return response.data.data;
  },

  async createBooking(payload: CreateBookingInput) {
    const response = await apiClient.post<ApiSuccess<Booking>>(
      "/bookings",
      payload,
    );
    return response.data.data;
  },

  async cancelBooking(bookingId: string) {
    const response = await apiClient.patch<ApiSuccess<Booking>>(
      `/bookings/${bookingId}/cancel`,
    );
    return response.data.data;
  },

  async markBookingOngoing(bookingId: string) {
    const response = await apiClient.patch<ApiSuccess<Booking>>(
      `/bookings/${bookingId}/start`,
    );
    return response.data.data;
  },

  async markBookingCompleted(bookingId: string) {
    const response = await apiClient.patch<ApiSuccess<Booking>>(
      `/bookings/${bookingId}/complete`,
    );
    return response.data.data;
  },
};
