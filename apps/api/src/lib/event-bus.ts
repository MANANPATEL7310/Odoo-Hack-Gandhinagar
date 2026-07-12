import { EventEmitter } from "events";
import { logger } from "../config/logger.js";

export type DomainEvents = {
  // Other Developer's Events
  "allocation:created": {
    allocationId: string;
    assetId: string;
    actorId: string;
  };
  "allocation:returned": {
    allocationId: string;
    assetId: string;
    actorId: string;
  };
  "transfer:requested": {
    requestId: string;
    assetId: string;
    requesterId: string;
  };
  "transfer:decided": {
    requestId: string;
    assetId: string;
    status: string;
    actorId: string;
  };
  "booking:created": { bookingId: string; assetId: string; actorId: string };
  "booking:cancelled": { bookingId: string; assetId: string; actorId: string };
  "booking:started": { bookingId: string; assetId: string; actorId: string };
  "booking:completed": { bookingId: string; assetId: string; actorId: string };
  "maintenance:created": {
    requestId: string;
    assetId: string;
    actorId: string;
  };
  "maintenance:decided": {
    requestId: string;
    assetId: string;
    status: string;
    actorId: string;
  };
  "audit:created": { cycleId: string; actorId: string };
  "audit:closed": { cycleId: string; actorId: string };
  "audit:item_marked": { itemId: string; status: string; actorId: string };

  // Our Notification Hooks & Events
  "asset.allocated": {
    assetId: string;
    holderEmployeeId?: string;
    assetTag: string;
  };
  "transferrequest.created": {
    requestId: string;
    assetId: string;
    assetTag: string;
    requestedById: string;
    requestedByName: string;
    targetDepartmentId?: string;
  };
  "transferrequest.approved": {
    requestId: string;
    assetId: string;
    assetTag: string;
    requestedById: string;
    targetEmployeeId?: string;
  };
  "transferrequest.rejected": {
    requestId: string;
    assetTag: string;
    requestedById: string;
    reason: string;
  };
  "booking.created": {
    bookingId: string;
    resourceName: string;
    bookedById: string;
    startTime: Date | string;
    endTime: Date | string;
  };
  "booking.cancelled": {
    bookingId: string;
    resourceName: string;
    bookedById: string;
  };
  "maintenancerequest.approved": {
    requestId: string;
    assetId: string;
    assetTag: string;
    raisedById: string;
    actorId: string;
  };
  "maintenancerequest.rejected": {
    requestId: string;
    assetTag: string;
    raisedById: string;
    reason: string;
    actorId: string;
  };
  "maintenancerequest.resolved": {
    requestId: string;
    assetId: string;
    assetTag: string;
    raisedById: string;
    actorId: string;
    currentHolderId?: string;
  };
  "maintenancerequest.created": {
    requestId: string;
    assetId: string;
    assetTag: string;
    raisedById: string;
  };
  "employee.role_changed": {
    employeeId: string;
    newRole: string;
  };
};

class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(30);
  }

  publish<K extends keyof DomainEvents>(
    event: K,
    payload: DomainEvents[K],
  ): void {
    logger.info({ event, payload }, "Domain event published");
    this.emitter.emit(event, payload);
  }

  subscribe<K extends keyof DomainEvents>(
    event: K,
    listener: (payload: DomainEvents[K]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, (payload) => {
      try {
        const result = listener(payload);
        if (result instanceof Promise) {
          result.catch((error) => {
            logger.error(
              { error, event, payload },
              "Error in async event subscriber",
            );
          });
        }
      } catch (error) {
        logger.error({ error, event, payload }, "Error in event subscriber");
      }
    });
  }
}

export const eventBus = new EventBus();
