const subscriptionTypeDefs = `#graphql
  type Subscription {
    id: ID!
    user: User
    userId: String!
    pod: Pod
    podId: String!
    status: SubscriptionStatus!
    billingCycle: BillingCycle!
    amountPerCycle: Float!
    totalPaid: Float!
    cyclesCompleted: Int!
    totalCycles: Int!
    nextBillingDate: String!
    startDate: String!
    endDate: String!
    cancelledAt: String!
    lastPaymentId: String!
    createdAt: String!
    updatedAt: String!
  }

  enum SubscriptionStatus {
    ACTIVE
    PAUSED
    CANCELLED
    EXPIRED
  }

  enum BillingCycle {
    DAILY
    WEEKLY
    MONTHLY
  }

  type PaginatedSubscriptions {
    items: [PodSubscription!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type PodSubscription {
    id: ID!
    user: User
    userId: String!
    pod: Pod
    podId: String!
    status: SubscriptionStatus!
    billingCycle: BillingCycle!
    amountPerCycle: Float!
    totalPaid: Float!
    cyclesCompleted: Int!
    totalCycles: Int!
    nextBillingDate: String!
    startDate: String!
    endDate: String!
    cancelledAt: String!
    lastPaymentId: String!
    createdAt: String!
    updatedAt: String!
  }

  type SubscribeResult {
    success: Boolean!
    subscription: PodSubscription!
    paymentId: String!
    isDummy: Boolean!
  }

  type CheckoutOccurrencePodResult {
    success: Boolean!
    pod: Pod!
    subscription: PodSubscription!
    paymentId: String!
    isDummy: Boolean!
  }
`;

export default subscriptionTypeDefs;
