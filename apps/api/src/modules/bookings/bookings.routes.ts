import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  listBookingsController,
  createBookingController,
  cancelBookingController,
  rescheduleBookingController,
} from "./bookings.controller.js";

export const bookingsRouter = createRouter();

bookingsRouter.get("/", requireAuth, listBookingsController);
bookingsRouter.post("/", requireAuth, createBookingController);
bookingsRouter.patch("/:id/cancel", requireAuth, cancelBookingController);
bookingsRouter.patch(
  "/:id/reschedule",
  requireAuth,
  rescheduleBookingController,
);
