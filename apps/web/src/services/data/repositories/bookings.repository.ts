import type {
  Asset,
  Booking,
  CreateBookingInput,
  Employee,
} from "../types/domain";

export interface BookingsRepository {
  listBookings(): Promise<Booking[]>;
  listAssets(): Promise<Asset[]>;
  listEmployees(): Promise<Employee[]>;
  createBooking(payload: CreateBookingInput): Promise<Booking>;
  cancelBooking(bookingId: string): Promise<Booking>;
  markBookingOngoing(bookingId: string): Promise<Booking>;
  markBookingCompleted(bookingId: string): Promise<Booking>;
}
