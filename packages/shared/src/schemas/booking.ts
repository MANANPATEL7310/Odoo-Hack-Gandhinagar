import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

export const bookingSchema = z.object({
  id: z.string(),
  resourceAssetId: z.string().min(1, "Resource Asset ID is required."),
  bookedByEmployeeId: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: bookingStatusSchema.default("UPCOMING"),
});

export const createBookingSchema = bookingSchema
  .pick({
    resourceAssetId: true,
    startTime: true,
    endTime: true,
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export const rescheduleBookingSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
