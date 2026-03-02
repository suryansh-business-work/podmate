const policyTypeDefs = `#graphql
  enum PolicyType {
    VENUE
    USER
    HOST
  }

  type Policy {
    id: ID!
    type: PolicyType!
    title: String!
    content: String!
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
  }
`;

export default policyTypeDefs;
