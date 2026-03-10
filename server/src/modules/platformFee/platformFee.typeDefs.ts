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

  enum EntityOverrideType {
    USER
    POD
    PLACE
  }

  type EntityFeeOverride {
    id: ID!
    entityType: EntityOverrideType!
    entityId: ID!
    feePercent: Float!
    enabled: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedEntityFeeOverrides {
    items: [EntityFeeOverride!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input UpsertEntityFeeOverrideInput {
    entityType: EntityOverrideType!
    entityId: ID!
    feePercent: Float!
    enabled: Boolean!
  }

  type EffectiveFee {
    feePercent: Float!
    source: String!
  }
`;

export default platformFeeTypeDefs;
