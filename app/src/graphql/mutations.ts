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
  mutation SendMessage($podId: ID!, $content: String!) {
    sendMessage(podId: $podId, content: $content) {
      id
      podId
      senderId
      content
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
