const platformFeeTypeDefs = `#graphql
  type PlatformFeeConfig {
    id: ID!
    globalFeePercent: Float!
    updatedAt: String!
  }

  type PlatformFeeOverride {
    id: ID!
    pincode: String!
    feePercent: Float!
    label: String!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedPlatformFeeOverrides {
    items: [PlatformFeeOverride!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input UpsertPlatformFeeOverrideInput {
    id: ID
    pincode: String!
    feePercent: Float!
    label: String
  }
`;

export default platformFeeTypeDefs;
