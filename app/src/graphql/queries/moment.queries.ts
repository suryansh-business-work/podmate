import { gql } from '@apollo/client';

export const GET_MOMENTS = gql`
  query GetMoments($page: Int, $limit: Int) {
    moments(page: $page, limit: $limit) {
      items {
        id
        user {
          id
          name
          avatar
          username
        }
        caption
        mediaUrls
        likeCount
        commentCount
        isLiked
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_USER_MOMENTS = gql`
  query GetUserMoments($userId: ID!, $page: Int, $limit: Int) {
    userMoments(userId: $userId, page: $page, limit: $limit) {
      items {
        id
        user {
          id
          name
          avatar
          username
        }
        caption
        mediaUrls
        likeCount
        commentCount
        isLiked
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;
