import { eventBus } from "../lib/event-bus.js";
import { notificationService } from "../services/notification/notification.service.js";
import { db } from "../lib/db.js";
import { NotificationTypes } from "@template/shared";

export function initNotificationSubscribers() {
  // 1. Asset Allocated
  eventBus.subscribe(
    "asset.allocated",
    async (payload: {
      assetId: string;
      holderEmployeeId?: string;
      assetTag: string;
    }) => {
      if (payload.holderEmployeeId) {
        await notificationService.create(
          payload.holderEmployeeId,
          NotificationTypes.AssetAssigned,
          `Asset ${payload.assetTag} has been allocated to you.`,
          "Asset",
          payload.assetId,
        );
      }
    },
  );

  // 2. Transfer Requested
  eventBus.subscribe(
    "transferrequest.created",
    async (payload: {
      requestId: string;
      assetId: string;
      assetTag: string;
      requestedById: string;
      requestedByName: string;
      targetDepartmentId?: string;
    }) => {
      // Notify all Asset Managers and Admin
      const managersAndAdmins = await db.employee.findMany({
        where: {
          role: { in: ["ASSET_MANAGER", "ADMIN"] },
          status: "ACTIVE",
        },
        select: { id: true },
      });

      const recipientIds = new Set<string>(managersAndAdmins.map((m) => m.id));

      // Also notify Department Head if department is targeted
      if (payload.targetDepartmentId) {
        const dept = await db.department.findUnique({
          where: { id: payload.targetDepartmentId },
          select: { headEmployeeId: true },
        });
        if (dept?.headEmployeeId) {
          recipientIds.add(dept.headEmployeeId);
        }
      }

      const message = `Transfer request raised by ${payload.requestedByName} for asset ${payload.assetTag}.`;
      for (const recipientId of recipientIds) {
        await notificationService.create(
          recipientId,
          NotificationTypes.TransferRequested,
          message,
          "TransferRequest",
          payload.requestId,
        );
      }
    },
  );

  // 3. Transfer Approved
  eventBus.subscribe(
    "transferrequest.approved",
    async (payload: {
      requestId: string;
      assetId: string;
      assetTag: string;
      requestedById: string;
      targetEmployeeId?: string;
    }) => {
      const message = `Transfer request approved for asset ${payload.assetTag}.`;

      // Notify Requester
      await notificationService.create(
        payload.requestedById,
        NotificationTypes.TransferApproved,
        message,
        "TransferRequest",
        payload.requestId,
      );

      // Notify target employee if set
      if (
        payload.targetEmployeeId &&
        payload.targetEmployeeId !== payload.requestedById
      ) {
        await notificationService.create(
          payload.targetEmployeeId,
          NotificationTypes.TransferApproved,
          `Asset ${payload.assetTag} has been transferred to you.`,
          "Asset",
          payload.assetId,
        );
      }
    },
  );

  // 4. Transfer Rejected
  eventBus.subscribe(
    "transferrequest.rejected",
    async (payload: {
      requestId: string;
      assetTag: string;
      requestedById: string;
      reason: string;
    }) => {
      await notificationService.create(
        payload.requestedById,
        NotificationTypes.TransferRejected,
        `Transfer request rejected for asset ${payload.assetTag}. Reason: ${payload.reason}`,
        "TransferRequest",
        payload.requestId,
      );
    },
  );

  // 5. Booking Confirmed
  eventBus.subscribe(
    "booking.created",
    async (payload: {
      bookingId: string;
      resourceName: string;
      bookedById: string;
      startTime: Date | string;
      endTime: Date | string;
    }) => {
      const startStr = new Date(payload.startTime).toLocaleString();
      const endStr = new Date(payload.endTime).toLocaleString();
      await notificationService.create(
        payload.bookedById,
        NotificationTypes.BookingConfirmed,
        `Booking confirmed for ${payload.resourceName} from ${startStr} to ${endStr}.`,
        "Booking",
        payload.bookingId,
      );
    },
  );

  // 6. Booking Cancelled
  eventBus.subscribe(
    "booking.cancelled",
    async (payload: {
      bookingId: string;
      resourceName: string;
      bookedById: string;
    }) => {
      await notificationService.create(
        payload.bookedById,
        NotificationTypes.BookingCancelled,
        `Booking for ${payload.resourceName} has been cancelled.`,
        "Booking",
        payload.bookingId,
      );
    },
  );

  // 7. Maintenance Approved
  eventBus.subscribe(
    "maintenancerequest.approved",
    async (payload: {
      requestId: string;
      assetId: string;
      assetTag: string;
      raisedById: string;
    }) => {
      await notificationService.create(
        payload.raisedById,
        NotificationTypes.MaintenanceApproved,
        `Maintenance request approved for asset ${payload.assetTag}.`,
        "MaintenanceRequest",
        payload.requestId,
      );
    },
  );

  // 8. Maintenance Rejected
  eventBus.subscribe(
    "maintenancerequest.rejected",
    async (payload: {
      requestId: string;
      assetTag: string;
      raisedById: string;
      reason: string;
    }) => {
      await notificationService.create(
        payload.raisedById,
        NotificationTypes.MaintenanceRejected,
        `Maintenance request rejected for asset ${payload.assetTag}. Reason: ${payload.reason}`,
        "MaintenanceRequest",
        payload.requestId,
      );
    },
  );

  // 9. Maintenance Resolved
  eventBus.subscribe(
    "maintenancerequest.resolved",
    async (payload: {
      requestId: string;
      assetId: string;
      assetTag: string;
      raisedById: string;
      currentHolderId?: string;
    }) => {
      const message = `Maintenance resolved for asset ${payload.assetTag}.`;
      await notificationService.create(
        payload.raisedById,
        NotificationTypes.MaintenanceResolved,
        message,
        "MaintenanceRequest",
        payload.requestId,
      );
      if (
        payload.currentHolderId &&
        payload.currentHolderId !== payload.raisedById
      ) {
        await notificationService.create(
          payload.currentHolderId,
          NotificationTypes.MaintenanceResolved,
          message,
          "Asset",
          payload.assetId,
        );
      }
    },
  );

  // 10. Role Changed
  eventBus.subscribe(
    "employee.role_changed",
    async (payload: { employeeId: string; newRole: string }) => {
      await notificationService.create(
        payload.employeeId,
        NotificationTypes.RoleChanged,
        `Your role has been updated to ${payload.newRole}.`,
      );
    },
  );
}
