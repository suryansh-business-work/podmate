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
`;

export default settingsTypeDefs;
