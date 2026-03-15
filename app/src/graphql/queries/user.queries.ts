import { gql } from '@apollo/client';

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
      roles
      activeRole
      isVerifiedHost
      savedPodIds
      themePreference
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
