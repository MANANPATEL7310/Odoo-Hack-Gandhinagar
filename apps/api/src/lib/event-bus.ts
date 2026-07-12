import { EventEmitter } from "events";
import { logger } from "../config/logger.js";

export type DomainEvents = {
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
};

class EventBus {
  private emitter = new EventEmitter();

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
