const podTypeDefs = `#graphql
  type Pod {
    id: ID!
    title: String!
    description: String!
    category: String!
    imageUrl: String!
    mediaUrls: [String!]!
    host: User!
    placeId: ID!
    place: Place
    feePerPerson: Float!
    maxSeats: Int!
    currentSeats: Int!
    dateTime: String!
    location: String!
    locationDetail: String!
    latitude: Float!
    longitude: Float!
    rating: Float!
    reviewCount: Int!
    status: PodStatus!
    closeReason: String!
    viewCount: Int!
    refundPolicy: String!
    attendees: [User!]!
    podType: PodType!
    startDate: String!
    endDate: String!
    recurrence: String!
    occurrenceCount: Int!
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

  enum PodType {
    ONE_TIME
    OCCURRENCE
  }

  enum RecurrenceFrequency {
    DAILY
    WEEKLY
    MONTHLY
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
    placeId: ID
    feePerPerson: Float!
    maxSeats: Int!
    dateTime: String!
    location: String!
    locationDetail: String!
    latitude: Float
    longitude: Float
    refundPolicy: String
    podType: PodType
    startDate: String
    endDate: String
    recurrence: RecurrenceFrequency
  }

  input UpdatePodInput {
    title: String
    imageUrl: String
    mediaUrls: [String!]
    latitude: Float
    longitude: Float
    podType: PodType
    startDate: String
    endDate: String
    recurrence: RecurrenceFrequency
  }

  type CheckoutResult {
    success: Boolean!
    pod: Pod!
    paymentId: ID!
    isDummy: Boolean!
  }

  type RemoveAttendeeResult {
    pod: Pod!
    refunded: Boolean!
    refundAmount: Float!
  }

  type ForceDeletePodResult {
    success: Boolean!
    removedAttendees: Int!
    totalRefunded: Float!
  }
`;

export default podTypeDefs;
