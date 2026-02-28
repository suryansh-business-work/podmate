const userTypeDefs = `#graphql
  enum UserRole {
    USER
    PLACE_OWNER
    ADMIN
  }

  type User {
    id: ID!
    phone: String!
    name: String!
    avatar: String!
    role: UserRole!
    isVerifiedHost: Boolean!
    createdAt: String!
  }

  type PaginatedUsers {
    items: [User!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }
`;

export default userTypeDefs;
