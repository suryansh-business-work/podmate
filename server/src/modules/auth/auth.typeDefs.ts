const authTypeDefs = `#graphql
  type OtpResponse {
    success: Boolean!
    message: String!
  }

  type AuthPayload {
    token: String!
    user: User!
    isNewUser: Boolean!
  }

  type AdminAuthPayload {
    token: String!
    user: User!
  }

  type ImageKitAuth {
    token: String!
    expire: Int!
    signature: String!
    publicKey: String!
  }

  type SendCredentialsResponse {
    success: Boolean!
    message: String!
  }
`;

export default authTypeDefs;
