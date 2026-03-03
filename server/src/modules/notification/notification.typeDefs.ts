const notificationTypeDefs = `#graphql
  enum NotificationType {
    POD_JOIN
    POD_LEAVE
    POD_UPDATE
    SUPPORT_REPLY
    GENERAL
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
`;

export default notificationTypeDefs;
