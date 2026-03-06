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

export const SAVE_POD = gql`
  mutation SavePod($podId: ID!) {
    savePod(podId: $podId) {
      id
      savedPodIds
    }
  }
`;

export const UNSAVE_POD = gql`
  mutation UnsavePod($podId: ID!) {
    unsavePod(podId: $podId) {
      id
      savedPodIds
    }
  }
`;

export const UPDATE_THEME_PREFERENCE = gql`
  mutation UpdateThemePreference($themePreference: String!) {
    updateThemePreference(themePreference: $themePreference) {
      id
      themePreference
    }
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

/* ── Reviews ── */

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;

export const REPLY_TO_REVIEW = gql`
  mutation ReplyToReview($input: ReplyReviewInput!) {
    replyToReview(input: $input) {
      id
      comment
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;

export const REPORT_REVIEW = gql`
  mutation ReportReview($input: ReportReviewInput!) {
    reportReview(input: $input) {
      id
      isReported
    }
  }
`;

/* ── Follow ── */

export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      followerId
      followingId
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

/* ── Feedback ── */

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

/* ── Pod Ideas ── */

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

/* ── Go Live ── */

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

export const REGISTER_PUSH_TOKEN = gql`
  mutation RegisterPushToken($input: RegisterPushTokenInput!) {
    registerPushToken(input: $input) {
      id
      token
      platform
      deviceId
      isActive
    }
  }
`;

export const UNREGISTER_PUSH_TOKEN = gql`
  mutation UnregisterPushToken($deviceId: String!) {
    unregisterPushToken(deviceId: $deviceId)
  }
`;
