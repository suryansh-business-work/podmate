const podTemplateTypeDefs = `#graphql
  type PodTemplate {
    id: ID!
    name: String!
    description: String!
    category: String!
    imageUrl: String!
    defaultTitle: String!
    defaultDescription: String!
    defaultFee: Float!
    defaultMaxSeats: Int!
    defaultRefundPolicy: String!
    isActive: Boolean!
    sortOrder: Int!
    createdAt: String!
  }

  type PaginatedPodTemplates {
    items: [PodTemplate!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreatePodTemplateInput {
    name: String!
    description: String
    category: String!
    imageUrl: String
    defaultTitle: String
    defaultDescription: String
    defaultFee: Float
    defaultMaxSeats: Int
    defaultRefundPolicy: String
    sortOrder: Int
  }

  input UpdatePodTemplateInput {
    name: String
    description: String
    category: String
    imageUrl: String
    defaultTitle: String
    defaultDescription: String
    defaultFee: Float
    defaultMaxSeats: Int
    defaultRefundPolicy: String
    isActive: Boolean
    sortOrder: Int
  }
`;

export default podTemplateTypeDefs;
