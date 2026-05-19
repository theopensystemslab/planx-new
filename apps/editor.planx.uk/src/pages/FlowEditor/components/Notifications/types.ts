export interface Notification {
  id: number;
  flow: {
    name: string;
    slug: string;
  };
  team: {
    name: string;
    slug: string;
  };
  type: string;
  createdAt: string; // timestamp
  resolvedAt: string | null; // nullable timestamp
  resolvedByUser: {
    firstName: string;
    lastName: string;
  } | null;
}

export interface NotificationProps {
  notifications: Notification[];
}
