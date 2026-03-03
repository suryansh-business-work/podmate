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
