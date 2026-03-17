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
  GET_EFFECTIVE_FEE,
} from './queries/misc.queries';

export { GET_ACTIVE_SLIDERS } from './queries/slider.queries';

export {
  GET_ACTIVE_CITIES,
  GET_TOP_CITIES,
  RESOLVE_LOCATION,
  RESOLVE_LOCATION_BY_PINCODE,
  SEARCH_GOOGLE_PLACES,
  GOOGLE_PLACE_DETAILS,
} from './queries/location.queries';

export { GET_MOMENTS, GET_USER_MOMENTS } from './queries/moment.queries';

export { GET_ACTIVE_POD_TEMPLATES } from './queries/podTemplate.queries';

export { GET_MY_SUBSCRIPTIONS, GET_SUBSCRIPTION_FOR_POD } from './queries/subscription.queries';

export { GET_ACTIVE_CATEGORIES } from './queries/category.queries';

export { GET_HOST_ANALYTICS, GET_VENUE_ANALYTICS } from './queries/dashboard.queries';

export { GET_MY_BANK_ACCOUNT } from './queries/bankAccount.queries';
