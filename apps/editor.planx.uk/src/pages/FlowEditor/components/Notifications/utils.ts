import type { Notification } from "./types";

/**
 * Splits unresolved notifications into current and superseded.
 * A notification is superseded when a more recent unresolved notification
 * exists for the same flow. Assumes input is sorted by created_at desc.
 */
export const partitionBySuperseded = (
  notifications: Notification[],
): { current: Notification[]; superseded: Notification[] } => {
  const seenFlows = new Set<string>();
  const current: Notification[] = [];
  const superseded: Notification[] = [];

  for (const notification of notifications) {
    if (seenFlows.has(notification.flow.slug)) {
      superseded.push(notification);
    } else {
      seenFlows.add(notification.flow.slug);
      current.push(notification);
    }
  }

  return { current, superseded };
};
