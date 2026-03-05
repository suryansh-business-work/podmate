const goLiveTypeDefs = `#graphql
  enum LiveSessionStatus {
    LIVE
    ENDED
  }

  type LiveSession {
    id: ID!
    hostId: ID!
    host: User!
    podId: ID!
    pod: Pod!
    title: String!
    description: String
    status: LiveSessionStatus!
    viewerCount: Int!
    isViewing: Boolean!
    startedAt: String!
    endedAt: String
  }

  type PaginatedLiveSessions {
    items: [LiveSession!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input StartLiveInput {
    podId: ID!
    title: String!
    description: String
  }
`;

export default goLiveTypeDefs;
