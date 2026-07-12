import { useMockDb } from "@/stores/mock-db";
import type { BookingsRepository } from "@/services/data/repositories/bookings.repository";
import type { Booking, CreateBookingInput } from "@/services/data/types/domain";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockBookingsRepository: BookingsRepository = {
  async listBookings() {
    await delay(150);
    return useMockDb.getState().bookings;
  },

  async listAssets() {
    await delay(120);
    return useMockDb.getState().assets;
  },

  async listEmployees() {
    await delay(120);
    return useMockDb.getState().users;
  },

  async createBooking(payload: CreateBookingInput) {
    await delay(180);

    const booking: Booking = {
      id: `b-${Date.now()}`,
      resourceAssetId: payload.resourceAssetId,
      bookedByEmployeeId: payload.bookedByEmployeeId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: "UPCOMING",
    };

    useMockDb.setState((state) => ({
      ...state,
      bookings: [booking, ...state.bookings],
    }));

    return booking;
  },

  async cancelBooking(bookingId: string) {
    await delay(180);

    const state = useMockDb.getState();
    const booking = state.bookings.find((item) => item.id === bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const updated: Booking = { ...booking, status: "CANCELLED" };
    useMockDb.setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((item) =>
        item.id === bookingId ? updated : item,
      ),
    }));

    return updated;
  },

  async markBookingOngoing(bookingId: string) {
    await delay(180);

    const state = useMockDb.getState();
    const booking = state.bookings.find((item) => item.id === bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const updated: Booking = { ...booking, status: "ONGOING" };
    useMockDb.setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((item) =>
        item.id === bookingId ? updated : item,
      ),
    }));

    return updated;
  },

  async markBookingCompleted(bookingId: string) {
    await delay(180);

    const state = useMockDb.getState();
    const booking = state.bookings.find((item) => item.id === bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const updated: Booking = { ...booking, status: "COMPLETED" };
    useMockDb.setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((item) =>
        item.id === bookingId ? updated : item,
      ),
    }));

    return updated;
  },
};
