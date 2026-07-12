import { z } from "zod";

export const NotificationTypes = {
  AssetAssigned: "AssetAssigned",
  TransferRequested: "TransferRequested",
  TransferApproved: "TransferApproved",
  TransferRejected: "TransferRejected",
  BookingConfirmed: "BookingConfirmed",
  BookingCancelled: "BookingCancelled",
  BookingReminder: "BookingReminder",
  MaintenanceApproved: "MaintenanceApproved",
  MaintenanceRejected: "MaintenanceRejected",
  MaintenanceResolved: "MaintenanceResolved",
  OverdueReturnAlert: "OverdueReturnAlert",
  OverdueBookingAlert: "OverdueBookingAlert",
  AuditDiscrepancyFlagged: "AuditDiscrepancyFlagged",
  RoleChanged: "RoleChanged",
} as const;

export type NotificationType =
  (typeof NotificationTypes)[keyof typeof NotificationTypes];

export const notificationSchema = z.object({
  id: z.string(),
  recipientEmployeeId: z.string(),
  type: z.string(),
  message: z.string(),
  relatedEntityType: z.string().nullable().optional(),
  relatedEntityId: z.string().nullable().optional(),
  isRead: z.boolean(),
  createdAt: z.coerce.date(),
});

export const notificationListSchema = z.array(notificationSchema);

export type Notification = z.infer<typeof notificationSchema>;
