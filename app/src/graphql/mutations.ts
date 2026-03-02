import { gql } from '@apollo/client';

export const SEND_OTP = gql`
  mutation SendOtp($phone: String!) {
    sendOtp(phone: $phone) {
      success
      message
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOtp($phone: String!, $otp: String!) {
    verifyOtp(phone: $phone, otp: $otp) {
      token
      isNewUser
      user {
        id
        phone
        name
        avatar
      }
    }
  }
`;

export const CREATE_POD = gql`
  mutation CreatePod($input: CreatePodInput!) {
    createPod(input: $input) {
      id
      title
      description
      category
    }
  }
`;

export const JOIN_POD = gql`
  mutation JoinPod($podId: ID!) {
    joinPod(podId: $podId) {
      id
      currentSeats
      attendees {
        id
        name
        avatar
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id
      name
      avatar
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($podId: ID!, $content: String!, $messageType: ChatMessageType, $mediaUrl: String) {
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

export const SEND_INVITES = gql`
  mutation SendInvites($podId: ID!, $contacts: [InviteInput!]!) {
    sendInvites(podId: $podId, contacts: $contacts) {
      success
      totalInvited
      smsMessages {
        phone
        body
      }
    }
  }
`;

export const COMPLETE_PROFILE = gql`
  mutation CompleteProfile($name: String!, $age: Int!) {
    completeProfile(name: $name, age: $age) {
      id
      phone
      name
      age
      avatar
      role
    }
  }
`;

export const GET_IMAGEKIT_AUTH = gql`
  mutation GetImageKitAuth {
    getImageKitAuth {
      token
      expire
      signature
    }
  }
`;

export const CREATE_SUPPORT_TICKET = gql`
  mutation CreateSupportTicket($input: CreateSupportTicketInput!) {
    createSupportTicket(input: $input) {
      id
      subject
      message
      status
      priority
      createdAt
    }
  }
`;
