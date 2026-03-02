const podTypeDefs = `#graphql
  type Pod {
    id: ID!
    title: String!
    description: String!
    category: String!
    imageUrl: String!
    mediaUrls: [String!]!
    host: User!
    feePerPerson: Float!
    maxSeats: Int!
    currentSeats: Int!
    dateTime: String!
    location: String!
    locationDetail: String!
    rating: Float!
    reviewCount: Int!
    status: PodStatus!
    closeReason: String!
    viewCount: Int!
    refundPolicy: String!
    attendees: [User!]!
    createdAt: String!
  }

  enum PodStatus {
    NEW
    CONFIRMED
    PENDING
    COMPLETED
    CANCELLED
    OPEN
    CLOSED
  }

  type PaginatedPods {
    items: [Pod!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreatePodInput {
    title: String!
    description: String!
    category: String!
    imageUrl: String
    mediaUrls: [String!]
    feePerPerson: Float!
    maxSeats: Int!
    dateTime: String!
    location: String!
    locationDetail: String!
    refundPolicy: String
  }

  input UpdatePodInput {
    title: String
    description: String
    category: String
    imageUrl: String
    mediaUrls: [String!]
    feePerPerson: Float
    maxSeats: Int
    dateTime: String
    location: String
    locationDetail: String
    status: PodStatus
    closeReason: String
  }
`;

export default podTypeDefs;
