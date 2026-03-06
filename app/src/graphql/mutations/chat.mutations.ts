import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $podId: ID!
    $content: String!
    $messageType: ChatMessageType
    $mediaUrl: String
  ) {
    sendMessage(podId: $podId, content: $content, messageType: $messageType, mediaUrl: $mediaUrl) {
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

export const ASK_CHATBOT = gql`
  mutation AskChatbot($message: String!) {
    askChatbot(message: $message) {
      reply
      messageId
    }
  }
`;

export const CLEAR_CHATBOT_HISTORY = gql`
  mutation ClearChatbotHistory {
    clearChatbotHistory
  }
`;
