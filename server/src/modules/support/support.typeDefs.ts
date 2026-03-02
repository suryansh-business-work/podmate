const supportTypeDefs = `#graphql
  enum SupportTicketStatus {
    OPEN
    IN_PROGRESS
    RESOLVED
    CLOSED
  }

  enum SupportTicketPriority {
    LOW
    MEDIUM
    HIGH
  }

  enum TicketReplySenderRole {
    USER
    ADMIN
  }

  type TicketReply {
    id: ID!
    senderId: ID!
    sender: User
    senderRole: TicketReplySenderRole!
    content: String!
    createdAt: String!
  }

  type SupportTicket {
    id: ID!
    userId: ID!
    user: User
    subject: String!
    message: String!
    status: SupportTicketStatus!
    priority: SupportTicketPriority!
    adminReply: String!
    replies: [TicketReply!]!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedSupportTickets {
    items: [SupportTicket!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type SupportTicketCounts {
    open: Int!
    inProgress: Int!
    resolved: Int!
    closed: Int!
    total: Int!
  }

  input CreateSupportTicketInput {
    subject: String!
    message: String!
    priority: SupportTicketPriority
  }

  input UpdateSupportTicketInput {
    status: SupportTicketStatus
    adminReply: String
    priority: SupportTicketPriority
  }
`;

export default supportTypeDefs;
