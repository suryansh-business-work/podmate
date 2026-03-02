const chatTypeDefs = `#graphql
  type ChatMessage {
    id: ID!
    podId: ID!
    senderId: ID!
    sender: User!
    content: String!
    createdAt: String!
  }
`;

export default chatTypeDefs;
