import { gql } from '@apollo/client';

export const GET_PODS = gql`
  query GetPods($category: String, $page: Int, $limit: Int, $search: String) {
    pods(category: $category, page: $page, limit: $limit, search: $search) {
      items {
        id
        title
        description
        category
        imageUrl
        mediaUrls
        feePerPerson
        maxSeats
        currentSeats
        dateTime
        location
        locationDetail
        latitude
        longitude
        rating
        reviewCount
        status
        host {
          id
          name
          avatar
          isVerifiedHost
        }
        attendees {
          id
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_POD = gql`
  query GetPod($id: ID!) {
    pod(id: $id) {
      id
      title
      description
      category
      imageUrl
      mediaUrls
      feePerPerson
      maxSeats
      currentSeats
      dateTime
      location
      locationDetail
      latitude
      longitude
      rating
      reviewCount
      status
      refundPolicy
      host {
        id
        name
        avatar
        isVerifiedHost
      }
      attendees {
        id
        name
        avatar
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      phone
      email
      name
      username
      dob
      avatar
      role
      isVerifiedHost
      savedPodIds
      themePreference
    }
  }
`;

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

export const GET_MY_PODS = gql`
  query GetMyPods {
    myPods {
      id
      title
      imageUrl
      mediaUrls
      category
      status
    }
  }
`;

export const GET_POLICIES = gql`
  query GetPolicies($type: String) {
    policies(type: $type) {
      id
      type
      title
      content
      isActive
      createdAt
    }
  }
`;

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

export const GET_APPROVED_PLACES = gql`
  query GetApprovedPlaces($search: String) {
    approvedPlaces(search: $search) {
      id
      name
      address
      city
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($page: Int, $limit: Int) {
    notifications(page: $page, limit: $limit) {
      items {
        id
        type
        title
        message
        data
        isRead
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const GET_APP_CONFIG = gql`
  query GetAppConfig($keys: [String!]!) {
    appConfig(keys: $keys) {
      key
      value
    }
  }
`;

export const GET_MY_PAYMENTS = gql`
  query GetMyPayments($page: Int, $limit: Int) {
    myPayments(page: $page, limit: $limit) {
      items {
        id
        amount
        type
        status
        transactionId
        gateway
        notes
        refundAmount
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

/* ── Reviews ── */

export const GET_REVIEWS = gql`
  query GetReviews($targetType: ReviewTargetType!, $targetId: ID!, $page: Int, $limit: Int) {
    reviews(targetType: $targetType, targetId: $targetId, page: $page, limit: $limit) {
      items {
        id
        targetType
        targetId
        rating
        comment
        parentId
        isReported
        createdAt
        user {
          id
          name
          avatar
        }
        replies {
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
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_REVIEW_STATS = gql`
  query GetReviewStats($targetType: ReviewTargetType!, $targetId: ID!) {
    reviewStats(targetType: $targetType, targetId: $targetId) {
      averageRating
      totalReviews
      distribution
    }
  }
`;

/* ── Follow ── */

export const GET_FOLLOW_STATS = gql`
  query GetFollowStats($userId: ID!) {
    followStats(userId: $userId) {
      followersCount
      followingCount
      isFollowing
    }
  }
`;

export const GET_FOLLOWERS = gql`
  query GetFollowers($userId: ID!, $page: Int, $limit: Int) {
    followers(userId: $userId, page: $page, limit: $limit) {
      items {
        id
        followerId
        createdAt
        follower {
          id
          name
          avatar
          isVerifiedHost
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_FOLLOWING = gql`
  query GetFollowing($userId: ID!, $page: Int, $limit: Int) {
    following(userId: $userId, page: $page, limit: $limit) {
      items {
        id
        followingId
        createdAt
        following {
          id
          name
          avatar
          isVerifiedHost
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

/* ── Feedback ── */

export const GET_MY_FEEDBACK = gql`
  query GetMyFeedback {
    myFeedback {
      id
      type
      title
      description
      status
      createdAt
    }
  }
`;

/* ── Pod Ideas ── */

export const GET_POD_IDEAS = gql`
  query GetPodIdeas($page: Int, $limit: Int, $category: String) {
    podIdeas(page: $page, limit: $limit, category: $category) {
      items {
        id
        title
        description
        category
        location
        estimatedBudget
        status
        upvoteCount
        hasUpvoted
        createdAt
        user {
          id
          name
          avatar
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_MY_POD_IDEAS = gql`
  query GetMyPodIdeas {
    myPodIdeas {
      id
      title
      description
      category
      status
      upvoteCount
      createdAt
    }
  }
`;

/* ── Go Live ── */

export const GET_ACTIVE_LIVE_SESSIONS = gql`
  query GetActiveLiveSessions($page: Int, $limit: Int) {
    activeLiveSessions(page: $page, limit: $limit) {
      items {
        id
        title
        description
        viewerCount
        isViewing
        startedAt
        host {
          id
          name
          avatar
        }
        pod {
          id
          title
          imageUrl
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_LIVE_SESSION_FOR_POD = gql`
  query GetLiveSessionForPod($podId: ID!) {
    liveSessionForPod(podId: $podId) {
      id
      title
      viewerCount
      isViewing
      startedAt
      host {
        id
        name
        avatar
      }
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    userProfile(userId: $userId) {
      id
      name
      avatar
      phone
    }
  }
`;

export const GET_USER_PODS = gql`
  query GetUserPods($userId: ID!) {
    userPods(userId: $userId) {
      id
      title
      description
      mediaUrls
      rating
      reviewCount
    }
  }
`;
