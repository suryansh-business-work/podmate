import { gql } from '@apollo/client';

export const GET_REVIEWS = gql`
  query GetReviews($targetType: ReviewTargetType!, $targetId: ID!, $page: Int, $limit: Int) {
    reviews(targetType: $targetType, targetId: $targetId, page: $page, limit: $limit) {
      items {
        id
        targetType
        targetId
        rating
        comment
        parentId
        isReported
        createdAt
        user {
          id
          name
          avatar
        }
        replies {
          id
          comment
          createdAt
          user {
            id
            name
            avatar
          }
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_REVIEW_STATS = gql`
  query GetReviewStats($targetType: ReviewTargetType!, $targetId: ID!) {
    reviewStats(targetType: $targetType, targetId: $targetId) {
      averageRating
      totalReviews
      distribution
    }
  }
`;
