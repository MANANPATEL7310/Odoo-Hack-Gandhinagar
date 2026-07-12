import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import { createBookingSchema, rescheduleBookingSchema } from "@template/shared";
import * as bookingsService from "./bookings.service.js";
import { BookingStatus } from "@prisma/client";

export const listBookingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const resourceAssetId = req.query.resourceAssetId as string | undefined;
    const statusQuery = req.query.status as string | undefined;
    let status: BookingStatus | undefined;
    if (statusQuery) {
      status = statusQuery.toUpperCase() as BookingStatus;
    }
    const startTime = req.query.startTime as string | undefined;
    const endTime = req.query.endTime as string | undefined;

    const result = await bookingsService.listBookings(
      { resourceAssetId, status, startTime, endTime },
      { id: req.user!.sub, role: req.user!.role },
    );

    return sendOk(res, result, "Bookings retrieved successfully.");
  },
);

export const createBookingController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = createBookingSchema.parse(req.body);
    const booking = await bookingsService.createBooking(parsed, {
      id: req.user!.sub,
      role: req.user!.role,
    });
    return sendCreated(res, booking, "Booking created successfully.");
  },
);

export const cancelBookingController = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingsService.cancelBooking(
      req.params.id as string,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, booking, "Booking cancelled successfully.");
  },
);

export const startBookingController = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingsService.startBooking(
      req.params.id as string,
      {
        id: req.user!.sub,
        role: req.user!.role,
      },
    );
    return sendOk(res, booking, "Booking started successfully.");
  },
);

export const completeBookingController = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingsService.completeBooking(
      req.params.id as string,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, booking, "Booking completed successfully.");
  },
);

export const rescheduleBookingController = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = rescheduleBookingSchema.parse(req.body);
    const booking = await bookingsService.rescheduleBooking(
      req.params.id as string,
      parsed,
      { id: req.user!.sub, role: req.user!.role },
    );
    return sendOk(res, booking, "Booking rescheduled successfully.");
  },
);
