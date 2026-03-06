import { gql } from '@apollo/client';

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

export const GET_MY_FEEDBACK = gql`
  query GetMyFeedback($page: Int, $limit: Int) {
    myFeedback(page: $page, limit: $limit) {
      items {
        id
        type
        title
        description
        status
        adminNotes
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

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
