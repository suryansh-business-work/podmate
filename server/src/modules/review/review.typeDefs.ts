const reviewTypeDefs = `#graphql
  enum ReviewTargetType {
    POD
    PLACE
  }

  type Review {
    id: ID!
    targetType: ReviewTargetType!
    targetId: ID!
    userId: ID!
    user: User!
    rating: Int!
    comment: String!
    parentId: String
    replies: [Review!]!
    isReported: Boolean!
    reportReason: String
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedReviews {
    items: [Review!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type ReviewStats {
    averageRating: Float!
    totalReviews: Int!
    distribution: [Int!]!
  }

  input CreateReviewInput {
    targetType: ReviewTargetType!
    targetId: ID!
    rating: Int!
    comment: String!
  }

  input ReplyReviewInput {
    reviewId: ID!
    comment: String!
  }

  input ReportReviewInput {
    reviewId: ID!
    reason: String!
  }
`;

export default reviewTypeDefs;
