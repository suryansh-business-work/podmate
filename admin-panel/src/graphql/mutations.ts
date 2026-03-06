import { gql } from '@apollo/client';

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SEND_ADMIN_CREDENTIALS = gql`
  mutation SendAdminCredentials($email: String!) {
    sendAdminCredentials(email: $email) {
      success
      message
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const CREATE_POLICY = gql`
  mutation CreatePolicy($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      id
      type
      title
      content
      version
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_POLICY = gql`
  mutation UpdatePolicy($id: ID!, $input: UpdatePolicyInput!) {
    updatePolicy(id: $id, input: $input) {
      id
      type
      title
      content
      version
      isActive
      updatedAt
    }
  }
`;

export const DELETE_POLICY = gql`
  mutation DeletePolicy($id: ID!) {
    deletePolicy(id: $id)
  }
`;

export const ADMIN_CREATE_USER = gql`
  mutation AdminCreateUser($phone: String!, $name: String!, $role: UserRole!) {
    adminCreateUser(phone: $phone, name: $name, role: $role) {
      id
      phone
      name
      role
      createdAt
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
      feePerPerson
      maxSeats
      dateTime
      location
      locationDetail
      status
      createdAt
    }
  }
`;

export const ADMIN_CREATE_PLACE = gql`
  mutation AdminCreatePlace($input: CreatePlaceInput!, $ownerId: ID!) {
    adminCreatePlace(input: $input, ownerId: $ownerId) {
      id
      name
      description
      address
      city
      category
      status
      isVerified
      createdAt
    }
  }
`;

export const APPROVE_PLACE = gql`
  mutation ApprovePlace($id: ID!) {
    approvePlace(id: $id) {
      id
      status
      isVerified
    }
  }
`;

export const REJECT_PLACE = gql`
  mutation RejectPlace($id: ID!) {
    rejectPlace(id: $id) {
      id
      status
      isVerified
    }
  }
`;

export const DELETE_PLACE = gql`
  mutation DeletePlace($id: ID!) {
    deletePlace(id: $id)
  }
`;

export const UPDATE_SUPPORT_TICKET = gql`
  mutation UpdateSupportTicket($id: ID!, $input: UpdateSupportTicketInput!) {
    updateSupportTicket(id: $id, input: $input) {
      id
      status
      priority
      adminReply
      updatedAt
    }
  }
`;

export const DELETE_SUPPORT_TICKET = gql`
  mutation DeleteSupportTicket($id: ID!) {
    deleteSupportTicket(id: $id)
  }
`;

export const TOGGLE_USER_ACTIVE = gql`
  mutation ToggleUserActive($userId: ID!, $isActive: Boolean!, $reason: String) {
    toggleUserActive(userId: $userId, isActive: $isActive, reason: $reason) {
      id
      isActive
      disableReason
    }
  }
`;

export const UPSERT_SETTING = gql`
  mutation UpsertSetting($input: UpsertSettingInput!) {
    upsertSetting(input: $input) {
      id
      key
      value
      category
      updatedAt
    }
  }
`;

export const DELETE_SETTING = gql`
  mutation DeleteSetting($key: String!) {
    deleteSetting(key: $key)
  }
`;

/* ── Pod Open/Close ── */

export const CLOSE_POD = gql`
  mutation ClosePod($id: ID!, $reason: String!) {
    closePod(id: $id, reason: $reason) {
      id
      status
      closeReason
    }
  }
`;

export const OPEN_POD = gql`
  mutation OpenPod($id: ID!) {
    openPod(id: $id) {
      id
      status
      closeReason
    }
  }
`;

/* ── Feature Flags ── */

export const CREATE_FEATURE_FLAG = gql`
  mutation CreateFeatureFlag($input: CreateFeatureFlagInput!) {
    createFeatureFlag(input: $input) {
      id
      key
      name
      description
      enabled
      rolloutPercentage
      platform
    }
  }
`;

export const UPDATE_FEATURE_FLAG = gql`
  mutation UpdateFeatureFlag($id: ID!, $input: UpdateFeatureFlagInput!) {
    updateFeatureFlag(id: $id, input: $input) {
      id
      key
      name
      description
      enabled
      rolloutPercentage
      platform
    }
  }
`;

export const DELETE_FEATURE_FLAG = gql`
  mutation DeleteFeatureFlag($id: ID!) {
    deleteFeatureFlag(id: $id)
  }
`;

export const TOGGLE_FEATURE_FLAG = gql`
  mutation ToggleFeatureFlag($id: ID!) {
    toggleFeatureFlag(id: $id) {
      id
      enabled
    }
  }
`;

/* ── Payments ── */

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      amount
      type
      status
    }
  }
`;

export const PROCESS_REFUND = gql`
  mutation ProcessRefund($input: ProcessRefundInput!) {
    processRefund(input: $input) {
      id
      amount
      refundAmount
      status
    }
  }
`;

export const COMPLETE_PAYMENT = gql`
  mutation CompletePayment($id: ID!, $transactionId: String) {
    completePayment(id: $id, transactionId: $transactionId) {
      id
      status
      transactionId
    }
  }
`;

/* ── Bulk Settings ── */

export const UPSERT_BULK_SETTINGS = gql`
  mutation UpsertBulkSettings($inputs: [UpsertSettingInput!]!) {
    upsertBulkSettings(inputs: $inputs) {
      id
      key
      value
      category
    }
  }
`;

/* ── Test Connections ── */

export const TEST_SMTP_CONNECTION = gql`
  mutation TestSmtpConnection {
    testSmtpConnection {
      success
      message
    }
  }
`;

export const TEST_OPENAI_CONNECTION = gql`
  mutation TestOpenAiConnection {
    testOpenAiConnection {
      success
      message
    }
  }
`;

export const TEST_IMAGEKIT_CONNECTION = gql`
  mutation TestImageKitConnection {
    testImageKitConnection {
      success
      message
    }
  }
`;

/* ── Delete User (cascade) ── */

export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

/* ── Delete Pod ── */

export const DELETE_POD = gql`
  mutation DeletePod($id: ID!) {
    deletePod(id: $id)
  }
`;

/* ── Remove Attendee ── */

export const REMOVE_ATTENDEE = gql`
  mutation RemoveAttendee($podId: ID!, $userId: ID!, $issueRefund: Boolean!) {
    removeAttendee(podId: $podId, userId: $userId, issueRefund: $issueRefund) {
      pod {
        id
        currentSeats
        attendees {
          id
          name
          avatar
        }
      }
      refunded
      refundAmount
    }
  }
`;

/* ── Force Delete Pod ── */

export const FORCE_DELETE_POD = gql`
  mutation ForceDeletePod($id: ID!, $issueRefunds: Boolean!) {
    forceDeletePod(id: $id, issueRefunds: $issueRefunds) {
      success
      removedAttendees
      totalRefunded
    }
  }
`;

/* ── Bulk Delete Mutations ── */

export const BULK_DELETE_PODS = gql`
  mutation BulkDeletePods($ids: [ID!]!, $issueRefunds: Boolean!) {
    bulkDeletePods(ids: $ids, issueRefunds: $issueRefunds)
  }
`;

export const BULK_DELETE_USERS = gql`
  mutation BulkDeleteUsers($ids: [ID!]!) {
    bulkDeleteUsers(ids: $ids)
  }
`;

export const BULK_DELETE_PLACES = gql`
  mutation BulkDeletePlaces($ids: [ID!]!) {
    bulkDeletePlaces(ids: $ids)
  }
`;

/* ── Support Ticket Replies ── */

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

export const ADMIN_CREATE_SUPPORT_TICKET = gql`
  mutation AdminCreateSupportTicket(
    $userId: ID!
    $subject: String!
    $message: String!
    $priority: String
  ) {
    adminCreateSupportTicket(
      userId: $userId
      subject: $subject
      message: $message
      priority: $priority
    ) {
      id
      subject
      message
      status
      priority
      createdAt
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

/* ── Broadcast Notification ── */

export const SEND_BROADCAST_NOTIFICATION = gql`
  mutation SendBroadcastNotification($input: SendBroadcastNotificationInput!) {
    sendBroadcastNotification(input: $input) {
      success
      recipientCount
    }
  }
`;

/* ── Platform Fees ── */

export const UPSERT_PLATFORM_FEE = gql`
  mutation UpsertPlatformFee($globalFeePercent: Float!) {
    upsertPlatformFee(globalFeePercent: $globalFeePercent) {
      id
      globalFeePercent
      updatedAt
    }
  }
`;

export const UPSERT_PLATFORM_FEE_OVERRIDE = gql`
  mutation UpsertPlatformFeeOverride($input: UpsertPlatformFeeOverrideInput!) {
    upsertPlatformFeeOverride(input: $input) {
      id
      pincode
      feePercent
      label
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PLATFORM_FEE_OVERRIDE = gql`
  mutation DeletePlatformFeeOverride($id: ID!) {
    deletePlatformFeeOverride(id: $id)
  }
`;

/* ── Callback Requests ── */

export const UPDATE_CALLBACK_REQUEST = gql`
  mutation UpdateCallbackRequest($id: ID!, $input: UpdateCallbackRequestInput!) {
    updateCallbackRequest(id: $id, input: $input) {
      id
      status
      adminNote
      scheduledAt
      completedAt
      updatedAt
    }
  }
`;

export const DELETE_CALLBACK_REQUEST = gql`
  mutation DeleteCallbackRequest($id: ID!) {
    deleteCallbackRequest(id: $id)
  }
`;

/* ── Feedback ── */

export const UPDATE_FEEDBACK_STATUS = gql`
  mutation UpdateFeedbackStatus($id: ID!, $input: UpdateFeedbackInput!) {
    updateFeedbackStatus(id: $id, input: $input) {
      id
      status
      adminNotes
      updatedAt
    }
  }
`;

export const DELETE_FEEDBACK = gql`
  mutation DeleteFeedback($id: ID!) {
    deleteFeedback(id: $id)
  }
`;

/* ── Pod Ideas ── */

export const UPDATE_POD_IDEA = gql`
  mutation UpdatePodIdea($id: ID!, $input: UpdatePodIdeaInput!) {
    updatePodIdea(id: $id, input: $input) {
      id
      status
      adminNotes
      updatedAt
    }
  }
`;

export const DELETE_POD_IDEA = gql`
  mutation DeletePodIdea($id: ID!) {
    deletePodIdea(id: $id)
  }
`;

/* ── Admin Update User (full) ── */

export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser($userId: ID!, $input: AdminUpdateUserInput!) {
    adminUpdateUser(userId: $userId, input: $input) {
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

/* ── Admin Update Pod ── */

export const ADMIN_UPDATE_POD = gql`
  mutation AdminUpdatePod($id: ID!, $input: AdminUpdatePodInput!) {
    adminUpdatePod(id: $id, input: $input) {
      id
      title
      description
      category
      imageUrl
      mediaUrls
      feePerPerson
      maxSeats
      dateTime
      location
      locationDetail
      status
    }
  }
`;
