const chatTypeDefs = `#graphql
  enum ChatMessageType {
    TEXT
    IMAGE
    VIDEO
  }

  type ChatMessage {
    id: ID!
    podId: ID!
    senderId: ID!
    sender: User!
    content: String!
    messageType: ChatMessageType!
    mediaUrl: String!
    createdAt: String!
  }
`;

export default chatTypeDefs;
