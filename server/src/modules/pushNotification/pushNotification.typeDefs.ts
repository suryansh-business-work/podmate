const pushNotificationTypeDefs = `#graphql
  enum PushPlatform {
    ANDROID
    IOS
    WEB
  }

  type PushToken {
    id: ID!
    userId: ID!
    token: String!
    platform: PushPlatform!
    deviceId: String!
    isActive: Boolean!
    createdAt: String!
  }

  input RegisterPushTokenInput {
    token: String!
    platform: PushPlatform!
    deviceId: String!
  }

  type PushNotificationResult {
    success: Boolean!
    ticketCount: Int!
  }
`;

export default pushNotificationTypeDefs;
