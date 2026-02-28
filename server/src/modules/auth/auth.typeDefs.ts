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

  type ImageKitAuth {
    token: String!
    expire: Int!
    signature: String!
  }
`;

export default authTypeDefs;
