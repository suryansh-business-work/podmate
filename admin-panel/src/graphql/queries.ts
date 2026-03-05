import { gql } from '@apollo/client';

export const GET_ADMIN_ME = gql`
  query GetAdminMe {
    me {
      id
      name
      email
      role
      themePreference
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int, $search: String, $sortBy: String, $order: String) {
    users(page: $page, limit: $limit, search: $search, sortBy: $sortBy, order: $order) {
      items {
        id
        phone
        email
        name
        username
        dob
        avatar
        role
        isVerifiedHost
        isActive
        disableReason
        podCount
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_PODS = gql`
  query GetPods(
    $category: String
    $page: Int
    $limit: Int
    $search: String
    $sortBy: String
    $order: String
  ) {
    pods(
      category: $category
      page: $page
      limit: $limit
      search: $search
      sortBy: $sortBy
      order: $order
    ) {
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
        placeId
        rating
        reviewCount
        status
        closeReason
        viewCount
        refundPolicy
        createdAt
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
        place {
          id
          name
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalPods
      activePods
      totalRevenue
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
      updatedAt
    }
  }
`;

export const GET_PLACES = gql`
  query GetPlaces($page: Int, $limit: Int, $search: String, $status: String, $sortBy: String, $order: String) {
    places(page: $page, limit: $limit, search: $search, status: $status, sortBy: $sortBy, order: $order) {
      items {
        id
        name
        description
        address
        city
        imageUrl
        mediaUrls
        owner {
          id
          name
          phone
        }
        category
        phone
        email
        status
        isVerified
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_SUPPORT_TICKETS = gql`
  query GetSupportTickets($page: Int, $limit: Int, $search: String, $status: String, $priority: String, $sortBy: String, $order: String) {
    supportTickets(page: $page, limit: $limit, search: $search, status: $status, priority: $priority, sortBy: $sortBy, order: $order) {
      items {
        id
        userId
        user {
          id
          name
          phone
        }
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
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_SUPPORT_TICKET_COUNTS = gql`
  query GetSupportTicketCounts {
    supportTicketCounts {
      open
      inProgress
      resolved
      closed
      total
    }
  }
`;

export const GET_APP_SETTINGS = gql`
  query GetAppSettings {
    appSettings {
      id
      key
      value
      category
      updatedAt
    }
  }
`;

export const GET_MAINTENANCE_MODE = gql`
  query GetMaintenanceMode {
    maintenanceMode
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      phone
      email
      name
      username
      dob
      avatar
      role
      isVerifiedHost
      isActive
      disableReason
      podCount
      createdAt
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
      placeId
      rating
      reviewCount
      status
      closeReason
      viewCount
      refundPolicy
      createdAt
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
      place {
        id
        name
      }
    }
  }
`;

export const GET_PLACE = gql`
  query GetPlace($id: ID!) {
    place(id: $id) {
      id
      name
      description
      address
      city
      imageUrl
      mediaUrls
      owner {
        id
        name
        phone
      }
      category
      phone
      email
      status
      isVerified
      createdAt
      updatedAt
    }
  }
`;

/* ── Feature Flags ── */

export const GET_FEATURE_FLAGS = gql`
  query GetFeatureFlags($page: Int, $limit: Int, $search: String) {
    featureFlags(page: $page, limit: $limit, search: $search) {
      items {
        id
        key
        name
        description
        enabled
        rolloutPercentage
        platform
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

/* ── Payments ── */

export const GET_PAYMENTS = gql`
  query GetPayments($page: Int, $limit: Int, $search: String, $type: String, $status: String, $sortBy: String, $order: String) {
    payments(page: $page, limit: $limit, search: $search, type: $type, status: $status, sortBy: $sortBy, order: $order) {
      items {
        id
        userId
        podId
        amount
        type
        status
        transactionId
        gateway
        notes
        refundAmount
        createdAt
        updatedAt
        user {
          id
          name
          phone
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_PAYMENT_STATS = gql`
  query GetPaymentStats {
    paymentStats {
      totalRevenue
      totalRefunds
      netRevenue
      totalTransactions
      pendingPayments
    }
  }
`;

/* ── Maintenance ── */

export const GET_MAINTENANCE_STATUS = gql`
  query GetMaintenanceStatus {
    maintenanceStatus {
      app
      website
    }
  }
`;

/* ── Settings by category ── */

export const GET_SETTINGS_BY_CATEGORY = gql`
  query GetSettingsByCategory($category: String!) {
    appSettingsByCategory(category: $category) {
      id
      key
      value
      category
      updatedAt
    }
  }
`;

/* ── Support Ticket Detail ── */

export const GET_SUPPORT_TICKET = gql`
  query GetSupportTicket($id: ID!) {
    supportTicket(id: $id) {
      id
      userId
      user {
        id
        name
        phone
      }
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

/* ── OpenAI Models ── */

export const GET_OPENAI_MODELS = gql`
  query GetOpenAiModels {
    openAiModels
  }
`;

/* ── Approved Places (for dropdowns) ── */

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

/* ── Admin Notifications (broadcast history) ── */

export const GET_ADMIN_NOTIFICATIONS = gql`
  query GetAdminNotifications($page: Int, $limit: Int) {
    adminNotifications(page: $page, limit: $limit) {
      items {
        id
        title
        message
        sentAt
        recipientCount
      }
      total
      page
      limit
      totalPages
    }
  }
`;

/* ── Platform Fees ── */

export const GET_PLATFORM_FEES = gql`
  query GetPlatformFees {
    platformFees {
      id
      globalFeePercent
      updatedAt
    }
  }
`;

export const GET_PLATFORM_FEE_OVERRIDES = gql`
  query GetPlatformFeeOverrides($page: Int, $limit: Int) {
    platformFeeOverrides(page: $page, limit: $limit) {
      items {
        id
        pincode
        feePercent
        label
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

/* ── Callback Requests ── */

export const GET_CALLBACK_REQUESTS = gql`
  query GetCallbackRequests($page: Int, $limit: Int, $search: String, $status: String, $sortBy: String, $order: String) {
    callbackRequests(page: $page, limit: $limit, search: $search, status: $status, sortBy: $sortBy, order: $order) {
      items {
        id
        userId
        user {
          id
          name
          phone
        }
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
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_CALLBACK_REQUEST_COUNTS = gql`
  query GetCallbackRequestCounts {
    callbackRequestCounts {
      pending
      scheduled
      completed
      cancelled
      total
    }
  }
`;
