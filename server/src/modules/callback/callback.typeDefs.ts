const callbackTypeDefs = `#graphql
  enum CallbackRequestStatus {
    PENDING
    SCHEDULED
    COMPLETED
    CANCELLED
  }

  type CallbackRequest {
    id: ID!
    userId: ID!
    user: User
    phone: String!
    reason: String!
    preferredTime: String!
    status: CallbackRequestStatus!
    adminNote: String!
    scheduledAt: String!
    completedAt: String!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedCallbackRequests {
    items: [CallbackRequest!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type CallbackRequestCounts {
    pending: Int!
    scheduled: Int!
    completed: Int!
    cancelled: Int!
    total: Int!
  }

  input CreateCallbackRequestInput {
    reason: String!
    preferredTime: String
  }

  input UpdateCallbackRequestInput {
    status: CallbackRequestStatus
    adminNote: String
    scheduledAt: String
  }
`;

export default callbackTypeDefs;
