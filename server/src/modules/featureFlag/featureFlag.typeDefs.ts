const featureFlagTypeDefs = `#graphql
  type FeatureFlag {
    id: ID!
    key: String!
    name: String!
    description: String!
    enabled: Boolean!
    rolloutPercentage: Int!
    platform: FeatureFlagPlatform!
    createdAt: String!
    updatedAt: String!
  }

  enum FeatureFlagPlatform {
    ALL
    APP
    ADMIN
    WEBSITE
  }

  type PaginatedFeatureFlags {
    items: [FeatureFlag!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreateFeatureFlagInput {
    key: String!
    name: String!
    description: String
    enabled: Boolean
    rolloutPercentage: Int
    platform: FeatureFlagPlatform
  }

  input UpdateFeatureFlagInput {
    name: String
    description: String
    enabled: Boolean
    rolloutPercentage: Int
    platform: FeatureFlagPlatform
  }
`;

export default featureFlagTypeDefs;
