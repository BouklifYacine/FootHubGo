export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  user: {
    image: string | null;
    name: string;
  };
};

export type NotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
};
