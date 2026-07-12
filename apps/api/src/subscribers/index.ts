import { initNotificationSubscribers } from "./notification.subscriber.js";
import { initActivityLogSubscribers } from "./activity-log.subscriber.js";

export function initSubscribers() {
  initNotificationSubscribers();
  initActivityLogSubscribers();
}
