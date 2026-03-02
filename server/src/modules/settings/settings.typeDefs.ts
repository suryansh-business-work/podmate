const settingsTypeDefs = `#graphql
  type AppSetting {
    id: ID!
    key: String!
    value: String!
    category: String!
    updatedAt: String!
  }

  input UpsertSettingInput {
    key: String!
    value: String!
    category: String!
  }

  type TestConnectionResult {
    success: Boolean!
    message: String!
  }

  type MaintenanceStatus {
    app: Boolean!
    website: Boolean!
  }
`;

export default settingsTypeDefs;
