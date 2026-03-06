/**
 * Backward-compatible re-export barrel.
 * All queries are now split into domain-specific files under ./queries/.
 * Import from this file or directly from the sub-modules.
 */
export { GET_PODS, GET_POD, GET_MY_PODS } from './queries/pods.queries';

export { GET_ME, GET_USER_PROFILE, GET_USER_PODS } from './queries/user.queries';

export { GET_CHAT_MESSAGES, GET_CHATBOT_HISTORY } from './queries/chat.queries';

export { GET_MY_SUPPORT_TICKETS, GET_MY_CALLBACK_REQUESTS } from './queries/support.queries';

export { GET_REVIEWS, GET_REVIEW_STATS } from './queries/reviews.queries';

export { GET_FOLLOW_STATS, GET_FOLLOWERS, GET_FOLLOWING } from './queries/social.queries';

export {
  GET_POLICIES,
  GET_APPROVED_PLACES,
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  GET_APP_CONFIG,
  GET_MY_PAYMENTS,
  GET_MY_FEEDBACK,
  GET_POD_IDEAS,
  GET_MY_POD_IDEAS,
  GET_ACTIVE_LIVE_SESSIONS,
  GET_LIVE_SESSION_FOR_POD,
} from './queries/misc.queries';
