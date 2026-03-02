const chatbotTypeDefs = `#graphql
  type ChatbotMessage {
    id: ID!
    userId: String!
    role: String!
    content: String!
    createdAt: String!
  }

  type ChatbotResponse {
    message: String!
    conversationId: String!
  }
`;

export default chatbotTypeDefs;
