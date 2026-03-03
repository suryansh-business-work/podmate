const chatbotTypeDefs = `#graphql
  type ChatbotMessage {
    id: ID!
    userId: String!
    role: String!
    content: String!
    createdAt: String!
  }

  type ChatbotResponse {
    reply: String!
    messageId: String!
  }
`;

export default chatbotTypeDefs;
