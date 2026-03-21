const meetingTypeDefs = `#graphql
  enum MeetingStatus {
    PENDING
    CONFIRMED
    COMPLETED
    CANCELLED
  }

  enum MeetingPurpose {
    POD_OWNER
    VENUE_OWNER
    GENERAL
  }

  type Meeting {
    id: ID!
    userId: ID!
    user: User
    userEmail: String!
    meetingDate: String!
    meetingTime: String!
    meetingLink: String!
    status: MeetingStatus!
    purpose: MeetingPurpose!
    adminNote: String!
    cancelReason: String!
    completedAt: String!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedMeetings {
    items: [Meeting!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type MeetingCounts {
    pending: Int!
    confirmed: Int!
    completed: Int!
    cancelled: Int!
    total: Int!
  }

  type BookedSlot {
    meetingTime: String!
  }

  input CreateMeetingInput {
    email: String!
    meetingDate: String!
    meetingTime: String!
    updateProfileEmail: Boolean!
    purpose: MeetingPurpose!
  }

  input UpdateMeetingInput {
    status: MeetingStatus
    adminNote: String
    meetingLink: String
    cancelReason: String
  }
`;

export default meetingTypeDefs;
