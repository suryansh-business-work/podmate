const notificationTypeDefs = `#graphql
  enum NotificationType {
    POD_JOIN
    POD_LEAVE
    POD_UPDATE
    SUPPORT_REPLY
    GENERAL
    ADMIN_BROADCAST
  }

  type Notification {
    id: ID!
    userId: ID!
    type: NotificationType!
    title: String!
    message: String!
    data: String!
    isRead: Boolean!
    createdAt: String!
  }

  type PaginatedNotifications {
    items: [Notification!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type AdminNotification {
    id: ID!
    title: String!
    message: String!
    sentAt: String!
    recipientCount: Int!
  }

  type PaginatedAdminNotifications {
    items: [AdminNotification!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input SendBroadcastNotificationInput {
    title: String!
    message: String!
  }

  type BroadcastNotificationResult {
    success: Boolean!
    recipientCount: Int!
  }
`;

export default notificationTypeDefs;
