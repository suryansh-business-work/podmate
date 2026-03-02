const paymentTypeDefs = `#graphql
  type Payment {
    id: ID!
    user: User
    userId: String!
    podId: String!
    amount: Float!
    type: PaymentType!
    status: PaymentStatus!
    transactionId: String!
    gateway: String!
    notes: String!
    refundAmount: Float!
    createdAt: String!
    updatedAt: String!
  }

  enum PaymentType {
    PAYMENT
    REFUND
    PARTIAL_REFUND
  }

  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
  }

  type PaginatedPayments {
    items: [Payment!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type PaymentStats {
    totalRevenue: Float!
    totalRefunds: Float!
    netRevenue: Float!
    totalTransactions: Int!
    pendingPayments: Int!
  }

  input CreatePaymentInput {
    userId: ID!
    podId: ID!
    amount: Float!
    type: PaymentType
    transactionId: String
    gateway: String
    notes: String
  }

  input ProcessRefundInput {
    paymentId: ID!
    amount: Float
    notes: String
  }
`;

export default paymentTypeDefs;
