import { gql } from '@apollo/client';

export const GET_FOLLOW_STATS = gql`
  query GetFollowStats($userId: ID!) {
    followStats(userId: $userId) {
      followersCount
      followingCount
      isFollowing
    }
  }
`;

export const GET_FOLLOWERS = gql`
  query GetFollowers($userId: ID!, $page: Int, $limit: Int) {
    followers(userId: $userId, page: $page, limit: $limit) {
      items {
        id
        followerId
        createdAt
        follower {
          id
          name
          avatar
          isVerifiedHost
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_FOLLOWING = gql`
  query GetFollowing($userId: ID!, $page: Int, $limit: Int) {
    following(userId: $userId, page: $page, limit: $limit) {
      items {
        id
        followingId
        createdAt
        following {
          id
          name
          avatar
          isVerifiedHost
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;
