const policyTypeDefs = `#graphql
  enum PolicyType {
    VENUE
    USER
    HOST
    TERMS_OF_SERVICE
    PRIVACY_POLICY
  }

  type Policy {
    id: ID!
    type: PolicyType!
    title: String!
    content: String!
    version: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type DashboardStats {
    totalUsers: Int!
    totalPods: Int!
    activePods: Int!
    totalRevenue: Float!
  }

  input CreatePolicyInput {
    type: PolicyType!
    title: String!
    content: String!
  }

  input UpdatePolicyInput {
    title: String
    content: String
    isActive: Boolean
    notifyUsers: Boolean
    notificationMethod: String
  }
`;

export default policyTypeDefs;
