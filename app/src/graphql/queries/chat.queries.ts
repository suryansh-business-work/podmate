import { gql } from '@apollo/client';

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($podId: ID!) {
    chatMessages(podId: $podId) {
      id
      podId
      senderId
      content
      messageType
      mediaUrl
      createdAt
      sender {
        id
        name
        avatar
      }
    }
  }
`;

export const GET_CHATBOT_HISTORY = gql`
  query GetChatbotHistory {
    chatbotHistory {
      id
      role
      content
      createdAt
    }
  }
`;
