const momentTypeDefs = `#graphql
  type Moment {
    id: ID!
    user: User!
    caption: String!
    mediaUrls: [String!]!
    likeCount: Int!
    commentCount: Int!
    isLiked: Boolean!
    isActive: Boolean!
    createdAt: String!
  }

  type MomentComment {
    id: ID!
    momentId: ID!
    user: User!
    content: String!
    createdAt: String!
  }

  type PaginatedMoments {
    items: [Moment!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type PaginatedMomentComments {
    items: [MomentComment!]!
    total: Int!
  }

  input CreateMomentInput {
    caption: String!
    mediaUrls: [String!]!
  }
`;

export default momentTypeDefs;
