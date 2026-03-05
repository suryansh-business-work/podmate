export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  recipientCount: number;
}

export interface PaginatedAdminNotifications {
  adminNotifications: {
    items: AdminNotification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BroadcastNotificationResult {
  sendBroadcastNotification: {
    success: boolean;
    recipientCount: number;
  };
}

export interface SendNotificationFormValues {
  title: string;
  message: string;
}
