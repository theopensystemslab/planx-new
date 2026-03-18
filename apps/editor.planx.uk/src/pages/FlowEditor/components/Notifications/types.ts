export interface Notification {
  id: number;
  flow: {
    name: string;
    slug: string;
  }
  team: {
    name: string;
    slug: string;
  }
  type: string;
  createdAt: string; // timestamp
  resolvedAt: string | null; // nullable timestamp
}

export interface NotificationProps {
  notifications: Notification[];
}

export interface NotificationCardProps {
  notification: Notification;
}
