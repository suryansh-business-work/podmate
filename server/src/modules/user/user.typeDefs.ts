const userTypeDefs = `#graphql
  enum UserRole {
    USER
    PLACE_OWNER
    ADMIN
  }

  type User {
    id: ID!
    phone: String!
    email: String!
    name: String!
    age: Int!
    avatar: String!
    role: UserRole!
    isVerifiedHost: Boolean!
    isActive: Boolean!
    disableReason: String!
    podCount: Int
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
