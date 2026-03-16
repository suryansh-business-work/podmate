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

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $avatar: String, $email: String) {
    updateProfile(name: $name, avatar: $avatar, email: $email) {
      id
      phone
      email
      name
      username
      dob
      avatar
      roles
      activeRole
      isVerifiedHost
      savedPodIds
      themePreference
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
      roles
      activeRole
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

export const SWITCH_ACTIVE_ROLE = gql`
  mutation SwitchActiveRole($role: UserRole!) {
    switchActiveRole(role: $role) {
      id
      roles
      activeRole
    }
  }
`;

export const SEND_EMAIL_OTP = gql`
  mutation SendEmailOtp($email: String!) {
    sendEmailOtp(email: $email) {
      success
      message
    }
  }
`;

export const VERIFY_EMAIL_OTP = gql`
  mutation VerifyEmailOtp($email: String!, $otp: String!) {
    verifyEmailOtp(email: $email, otp: $otp) {
      id
      email
      isEmailVerified
    }
  }
`;
