/**
 * Barrel re-export of all GraphQL mutations, split by domain.
 * Consumers can import from here without changing existing imports:
 *   import { SEND_OTP, CREATE_POD } from '../graphql/mutations';
 */
export {
  SEND_OTP,
  VERIFY_OTP,
  UPDATE_PROFILE,
  COMPLETE_PROFILE,
  UPDATE_THEME_PREFERENCE,
  REGISTER_PUSH_TOKEN,
  UNREGISTER_PUSH_TOKEN,
} from './auth.mutations';

export {
  CREATE_POD,
  JOIN_POD,
  CHECKOUT_POD,
  DELETE_POD,
  SAVE_POD,
  UNSAVE_POD,
  TRACK_POD_VIEW,
  REOPEN_POD,
} from './pods.mutations';

export { SEND_MESSAGE, ASK_CHATBOT, CLEAR_CHATBOT_HISTORY } from './chat.mutations';
export { CREATE_REVIEW, REPLY_TO_REVIEW, REPORT_REVIEW } from './reviews.mutations';
export { FOLLOW_USER, UNFOLLOW_USER } from './social.mutations';

export {
  SEND_INVITES,
  GET_IMAGEKIT_AUTH,
  CREATE_SUPPORT_TICKET,
  REPLY_SUPPORT_TICKET,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  CREATE_PLACE,
  SUBMIT_FEEDBACK,
  SUBMIT_POD_IDEA,
  UPVOTE_POD_IDEA,
  REMOVE_UPVOTE,
  START_LIVE_SESSION,
  END_LIVE_SESSION,
  JOIN_LIVE_SESSION,
  LEAVE_LIVE_SESSION,
  REQUEST_CALLBACK,
} from './misc.mutations';

export {
  CREATE_MOMENT,
  DELETE_MOMENT,
  LIKE_MOMENT,
  UNLIKE_MOMENT,
  ADD_MOMENT_COMMENT,
} from './moment.mutations';

export {
  CHECKOUT_OCCURRENCE_POD,
  CANCEL_SUBSCRIPTION,
  RENEW_SUBSCRIPTION,
} from './subscription.mutations';
