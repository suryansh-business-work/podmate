const followTypeDefs = `#graphql
  type Follow {
    id: ID!
    followerId: ID!
    followingId: ID!
    follower: User!
    following: User!
    createdAt: String!
  }

  type FollowStats {
    followersCount: Int!
    followingCount: Int!
    isFollowing: Boolean!
  }

  type PaginatedFollows {
    items: [Follow!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }
`;

export default followTypeDefs;
