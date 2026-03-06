import { gql } from '@apollo/client';

export const GET_MY_SUPPORT_TICKETS = gql`
  query GetMySupportTickets {
    mySupportTickets {
      id
      subject
      message
      status
      priority
      adminReply
      replies {
        id
        senderRole
        content
        createdAt
        sender {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_CALLBACK_REQUESTS = gql`
  query GetMyCallbackRequests {
    myCallbackRequests {
      id
      phone
      reason
      preferredTime
      status
      adminNote
      scheduledAt
      completedAt
      createdAt
      updatedAt
    }
  }
`;
