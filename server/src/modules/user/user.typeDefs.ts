const userTypeDefs = `#graphql
  enum UserRole {
    USER
    VENUE_OWNER
    HOST
    ADMIN
  }

  type User {
    id: ID!
    phone: String!
    email: String!
    username: String!
    name: String!
    age: Int!
    dob: String!
    avatar: String!
    roles: [UserRole!]!
    activeRole: UserRole!
    isVerifiedHost: Boolean!
    isActive: Boolean!
    disableReason: String!
    podCount: Int
    savedPodIds: [ID!]!
    themePreference: String!
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
