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

export const CHECKOUT_POD = gql`
  mutation CheckoutPod($podId: ID!) {
    checkoutPod(podId: $podId) {
      success
      pod {
        id
        currentSeats
        attendees {
          id
          name
          avatar
        }
      }
      paymentId
      isDummy
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $avatar: String, $email: String) {
    updateProfile(name: $name, avatar: $avatar, email: $email) {
      id
      name
      avatar
      email
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
  mutation CompleteProfile($username: String!, $name: String!, $dob: String!) {
    completeProfile(username: $username, name: $name, dob: $dob) {
      id
      phone
      name
      username
      dob
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
      publicKey
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

export const TRACK_POD_VIEW = gql`
  mutation TrackPodView($podId: ID!) {
    trackPodView(podId: $podId) {
      id
      viewCount
    }
  }
`;

export const REPLY_SUPPORT_TICKET = gql`
  mutation ReplySupportTicket($ticketId: ID!, $content: String!) {
    replySupportTicket(ticketId: $ticketId, content: $content) {
      id
      status
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
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const DELETE_POD = gql`
  mutation DeletePod($id: ID!) {
    deletePod(id: $id)
  }
`;
