import { gql } from '@apollo/client';

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
    markNotificationRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const CREATE_PLACE = gql`
  mutation CreatePlace($input: CreatePlaceInput!) {
    createPlace(input: $input) {
      id
      name
      status
      latitude
      longitude
    }
  }
`;

export const SUBMIT_FEEDBACK = gql`
  mutation SubmitFeedback($input: CreateFeedbackInput!) {
    submitFeedback(input: $input) {
      id
      type
      title
      status
      createdAt
    }
  }
`;

export const SUBMIT_POD_IDEA = gql`
  mutation SubmitPodIdea($input: CreatePodIdeaInput!) {
    submitPodIdea(input: $input) {
      id
      title
      description
      category
      upvoteCount
      createdAt
    }
  }
`;

export const UPVOTE_POD_IDEA = gql`
  mutation UpvotePodIdea($id: ID!) {
    upvotePodIdea(id: $id) {
      id
      upvoteCount
      hasUpvoted
    }
  }
`;

export const REMOVE_UPVOTE = gql`
  mutation RemoveUpvote($id: ID!) {
    removeUpvote(id: $id) {
      id
      upvoteCount
      hasUpvoted
    }
  }
`;

export const START_LIVE_SESSION = gql`
  mutation StartLiveSession($input: StartLiveInput!) {
    startLiveSession(input: $input) {
      id
      title
      status
      viewerCount
      startedAt
    }
  }
`;

export const END_LIVE_SESSION = gql`
  mutation EndLiveSession($id: ID!) {
    endLiveSession(id: $id) {
      id
      status
      endedAt
    }
  }
`;

export const JOIN_LIVE_SESSION = gql`
  mutation JoinLiveSession($id: ID!) {
    joinLiveSession(id: $id) {
      id
      viewerCount
      isViewing
    }
  }
`;

export const LEAVE_LIVE_SESSION = gql`
  mutation LeaveLiveSession($id: ID!) {
    leaveLiveSession(id: $id) {
      id
      viewerCount
      isViewing
    }
  }
`;

export const REQUEST_CALLBACK = gql`
  mutation RequestCallback($input: CreateCallbackRequestInput!) {
    requestCallback(input: $input) {
      id
      reason
      preferredTime
      status
      createdAt
    }
  }
`;
