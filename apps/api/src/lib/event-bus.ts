import { EventEmitter } from "events";

class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(30);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publish(event: string, payload: any): void {
    this.emitter.emit(event, payload);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe(event: string, handler: (payload: any) => Promise<void>): void {
    this.emitter.on(event, async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`Error in event subscriber for event "${event}":`, error);
      }
    });
  }
}

export const eventBus = new EventBus();
