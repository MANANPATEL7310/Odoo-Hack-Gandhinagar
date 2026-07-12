import { db } from "../../lib/db.js";
import { eventBus } from "../../lib/event-bus.js";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../lib/errors.js";
import { Role, AssetStatus, BookingStatus, Prisma } from "@prisma/client";
import type {
  CreateBookingInput,
  RescheduleBookingInput,
} from "@template/shared";

export async function listBookings(
  filters: {
    resourceAssetId?: string;
    status?: BookingStatus;
    startTime?: string;
    endTime?: string;
  },
  _currentUser: { id: string; role: Role },
) {
  const whereClause: Prisma.BookingWhereInput = {};

  if (filters.resourceAssetId) {
    whereClause.resourceAssetId = filters.resourceAssetId;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }

  // Filter based on dates if provided
  if (filters.startTime || filters.endTime) {
    whereClause.AND = [];
    if (filters.startTime) {
      whereClause.AND.push({ startTime: { gte: new Date(filters.startTime) } });
    }
    if (filters.endTime) {
      whereClause.AND.push({ endTime: { lte: new Date(filters.endTime) } });
    }
  }

  const bookings = await db.booking.findMany({
    where: whereClause,
    include: {
      resourceAsset: {
        select: { id: true, name: true, assetTag: true, status: true },
      },
      bookedBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return { data: bookings };
}

export async function createBooking(
  input: CreateBookingInput,
  currentUser: { id: string; role: Role },
) {
  const asset = await db.asset.findUnique({
    where: { id: input.resourceAssetId },
  });

  if (!asset) {
    throw new NotFoundError("Asset not found.");
  }

  // Check if asset is bookable
  if (!asset.isBookable) {
    throw new BadRequestError("Asset is not bookable.", "ASSET_NOT_BOOKABLE");
  }

  // Ensure asset is not retired or disposed
  if (
    asset.status === AssetStatus.RETIRED ||
    asset.status === AssetStatus.DISPOSED
  ) {
    throw new BadRequestError(
      "Retired or disposed assets cannot be booked.",
      "ASSET_NOT_BOOKABLE",
    );
  }

  const booking = await db.$transaction(async (tx) => {
    // Check overlapping bookings
    const overlap = await tx.booking.findFirst({
      where: {
        resourceAssetId: input.resourceAssetId,
        status: { not: BookingStatus.CANCELLED },
        startTime: { lt: input.endTime },
        endTime: { gt: input.startTime },
      },
      include: {
        bookedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (overlap) {
      throw new ConflictError(
        "Booking overlaps with an existing booking.",
        "BOOKING_OVERLAP",
        { conflictingBooking: overlap },
      );
    }

    const created = await tx.booking.create({
      data: {
        resourceAssetId: input.resourceAssetId,
        bookedByEmployeeId: currentUser.id,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        status: BookingStatus.UPCOMING,
      },
    });

    return created;
  });

  eventBus.publish("booking.created", {
    bookingId: booking.id,
    resourceName: asset.name,
    bookedById: currentUser.id,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  eventBus.publish("booking:created", {
    bookingId: booking.id,
    assetId: asset.id,
    actorId: currentUser.id,
  });

  return db.booking.findUnique({
    where: { id: booking.id },
    include: {
      resourceAsset: true,
      bookedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function cancelBooking(
  id: string,
  currentUser: { id: string; role: Role },
) {
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      resourceAsset: true,
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found.");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new BadRequestError("Booking is already cancelled.");
  }

  if (booking.status === BookingStatus.COMPLETED) {
    throw new BadRequestError(
      "Cannot cancel a completed booking.",
      "CANNOT_CANCEL_COMPLETED_BOOKING",
    );
  }

  // Permissions validation
  let isAllowed = false;

  if (
    currentUser.role === Role.ADMIN ||
    currentUser.role === Role.ASSET_MANAGER
  ) {
    isAllowed = true;
  } else if (booking.bookedByEmployeeId === currentUser.id) {
    isAllowed = true;
  } else if (currentUser.role === Role.DEPARTMENT_HEAD) {
    // Department Head can cancel if creator is in their department
    const head = await db.employee.findUnique({
      where: { id: currentUser.id },
      select: { departmentId: true },
    });
    const creator = await db.employee.findUnique({
      where: { id: booking.bookedByEmployeeId },
      select: { departmentId: true },
    });

    if (
      head?.departmentId &&
      creator?.departmentId &&
      head.departmentId === creator.departmentId
    ) {
      isAllowed = true;
    }
  }

  if (!isAllowed) {
    throw new ForbiddenError(
      "You do not have permission to cancel this booking.",
    );
  }

  const updated = await db.booking.update({
    where: { id },
    data: { status: BookingStatus.CANCELLED },
  });

  eventBus.publish("booking.cancelled", {
    bookingId: booking.id,
    resourceName: booking.resourceAsset.name,
    bookedById: booking.bookedByEmployeeId,
  });

  eventBus.publish("booking:cancelled", {
    bookingId: booking.id,
    assetId: booking.resourceAssetId,
    actorId: currentUser.id,
  });

  return db.booking.findUnique({
    where: { id: updated.id },
    include: {
      resourceAsset: true,
      bookedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function rescheduleBooking(
  id: string,
  input: RescheduleBookingInput,
  currentUser: { id: string; role: Role },
) {
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      resourceAsset: true,
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found.");
  }

  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.COMPLETED
  ) {
    throw new BadRequestError("Only active bookings can be rescheduled.");
  }

  // Only the owner can reschedule
  if (booking.bookedByEmployeeId !== currentUser.id) {
    throw new ForbiddenError(
      "Only the booking owner can reschedule this booking.",
    );
  }

  const result = await db.$transaction(async (tx) => {
    // 1. Cancel the old booking
    await tx.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    // 2. Overlap check for the new window (excluding the cancelled old booking)
    const overlap = await tx.booking.findFirst({
      where: {
        id: { not: id },
        resourceAssetId: booking.resourceAssetId,
        status: { not: BookingStatus.CANCELLED },
        startTime: { lt: input.endTime },
        endTime: { gt: input.startTime },
      },
      include: {
        bookedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (overlap) {
      throw new ConflictError(
        "Booking overlaps with an existing booking.",
        "BOOKING_OVERLAP",
        { conflictingBooking: overlap },
      );
    }

    // 3. Create the new booking
    const created = await tx.booking.create({
      data: {
        resourceAssetId: booking.resourceAssetId,
        bookedByEmployeeId: booking.bookedByEmployeeId,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        status: BookingStatus.UPCOMING,
      },
    });

    return { created };
  });

  eventBus.publish("booking.cancelled", {
    bookingId: booking.id,
    resourceName: booking.resourceAsset.name,
    bookedById: booking.bookedByEmployeeId,
  });

  eventBus.publish("booking:cancelled", {
    bookingId: booking.id,
    assetId: booking.resourceAssetId,
    actorId: currentUser.id,
  });

  eventBus.publish("booking.created", {
    bookingId: result.created.id,
    resourceName: booking.resourceAsset.name,
    bookedById: booking.bookedByEmployeeId,
    startTime: result.created.startTime,
    endTime: result.created.endTime,
  });

  eventBus.publish("booking:created", {
    bookingId: result.created.id,
    assetId: booking.resourceAssetId,
    actorId: currentUser.id,
  });

  return db.booking.findUnique({
    where: { id: result.created.id },
    include: {
      resourceAsset: true,
      bookedBy: { select: { id: true, name: true, email: true } },
    },
  });
}
