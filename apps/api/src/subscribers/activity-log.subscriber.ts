import { eventBus } from "../lib/event-bus.js";
import { db } from "../lib/db.js";

export function initActivityLogSubscribers() {
  // 1. Allocation Created
  eventBus.subscribe("allocation:created", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "ALLOCATION_CREATED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { allocationId: payload.allocationId },
      },
    });
  });

  // 2. Allocation Returned
  eventBus.subscribe("allocation:returned", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "ALLOCATION_RETURNED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { allocationId: payload.allocationId },
      },
    });
  });

  // 3. Transfer Requested
  eventBus.subscribe("transfer:requested", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.requesterId,
        action: "TRANSFER_REQUESTED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { requestId: payload.requestId },
      },
    });
  });

  // 4. Transfer Decided
  eventBus.subscribe("transfer:decided", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: `TRANSFER_${payload.status.toUpperCase()}`,
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { requestId: payload.requestId },
      },
    });
  });

  // 5. Booking Created
  eventBus.subscribe("booking:created", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "BOOKING_CREATED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { bookingId: payload.bookingId },
      },
    });
  });

  // 6. Booking Cancelled
  eventBus.subscribe("booking:cancelled", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "BOOKING_CANCELLED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { bookingId: payload.bookingId },
      },
    });
  });

  // 7. Maintenance Request Created
  eventBus.subscribe("maintenancerequest.created", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.raisedById,
        action: "MAINTENANCE_CREATED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { requestId: payload.requestId },
      },
    });
  });

  // 8. Maintenance Request Approved
  eventBus.subscribe("maintenancerequest.approved", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "MAINTENANCE_APPROVED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { requestId: payload.requestId },
      },
    });
  });

  // 9. Maintenance Request Rejected
  eventBus.subscribe("maintenancerequest.rejected", async (payload) => {
    const request = await db.maintenanceRequest.findUnique({
      where: { id: payload.requestId },
      select: { assetId: true },
    });
    if (request) {
      await db.activityLog.create({
        data: {
          actorEmployeeId: payload.actorId,
          action: "MAINTENANCE_REJECTED",
          targetEntityType: "Asset",
          targetEntityId: request.assetId,
          metadata: { requestId: payload.requestId, reason: payload.reason },
        },
      });
    }
  });

  // 10. Maintenance Request Resolved
  eventBus.subscribe("maintenancerequest.resolved", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "MAINTENANCE_RESOLVED",
        targetEntityType: "Asset",
        targetEntityId: payload.assetId,
        metadata: { requestId: payload.requestId },
      },
    });
  });

  // 11. Audit Cycle Created
  eventBus.subscribe("audit:created", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "AUDIT_CYCLE_CREATED",
        targetEntityType: "AuditCycle",
        targetEntityId: payload.cycleId,
      },
    });
  });

  // 12. Audit Cycle Closed
  eventBus.subscribe("audit:closed", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: "AUDIT_CYCLE_CLOSED",
        targetEntityType: "AuditCycle",
        targetEntityId: payload.cycleId,
      },
    });
  });

  // 13. Audit Item Marked
  eventBus.subscribe("audit:item_marked", async (payload) => {
    await db.activityLog.create({
      data: {
        actorEmployeeId: payload.actorId,
        action: `AUDIT_ITEM_${payload.status.toUpperCase()}`,
        targetEntityType: "AuditCycleItem",
        targetEntityId: payload.itemId,
      },
    });
  });
}
