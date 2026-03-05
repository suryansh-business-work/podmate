const feedbackTypeDefs = `#graphql
  enum FeedbackType {
    BUG
    FEATURE
    GENERAL
  }

  enum FeedbackStatus {
    PENDING
    REVIEWED
    RESOLVED
  }

  type Feedback {
    id: ID!
    userId: ID!
    user: User!
    type: FeedbackType!
    title: String!
    description: String!
    status: FeedbackStatus!
    adminNotes: String
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedFeedback {
    items: [Feedback!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreateFeedbackInput {
    type: FeedbackType!
    title: String!
    description: String!
  }

  input UpdateFeedbackInput {
    status: FeedbackStatus
    adminNotes: String
  }
`;

export default feedbackTypeDefs;
