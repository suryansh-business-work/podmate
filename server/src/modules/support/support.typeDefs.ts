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

  type SupportTicket {
    id: ID!
    userId: ID!
    user: User
    subject: String!
    message: String!
    status: SupportTicketStatus!
    priority: SupportTicketPriority!
    adminReply: String!
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
