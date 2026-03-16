/**
 * Backward-compatible re-export barrel.
 * All mutations are now split into domain-specific files under ./mutations/.
 * Import from this file or directly from the sub-modules.
 */
export {
  SEND_OTP,
  VERIFY_OTP,
  UPDATE_PROFILE,
  COMPLETE_PROFILE,
  UPDATE_THEME_PREFERENCE,
  REGISTER_PUSH_TOKEN,
  UNREGISTER_PUSH_TOKEN,
  SWITCH_ACTIVE_ROLE,
  SEND_EMAIL_OTP,
  VERIFY_EMAIL_OTP,
} from './mutations/auth.mutations';

export {
  CREATE_POD,
  JOIN_POD,
  CHECKOUT_POD,
  DELETE_POD,
  SAVE_POD,
  UNSAVE_POD,
  TRACK_POD_VIEW,
  REOPEN_POD,
} from './mutations/pods.mutations';

export { SEND_MESSAGE, ASK_CHATBOT, CLEAR_CHATBOT_HISTORY } from './mutations/chat.mutations';
export { CREATE_REVIEW, REPLY_TO_REVIEW, REPORT_REVIEW } from './mutations/reviews.mutations';
export { FOLLOW_USER, UNFOLLOW_USER } from './mutations/social.mutations';

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
} from './mutations/misc.mutations';

export {
  CREATE_MOMENT,
  DELETE_MOMENT,
  LIKE_MOMENT,
  UNLIKE_MOMENT,
  ADD_MOMENT_COMMENT,
} from './mutations/moment.mutations';

export {
  CHECKOUT_OCCURRENCE_POD,
  CANCEL_SUBSCRIPTION,
  RENEW_SUBSCRIPTION,
} from './mutations/subscription.mutations';
