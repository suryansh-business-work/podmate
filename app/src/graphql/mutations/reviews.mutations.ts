import { gql } from '@apollo/client';

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;

export const REPLY_TO_REVIEW = gql`
  mutation ReplyToReview($input: ReplyReviewInput!) {
    replyToReview(input: $input) {
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
`;

export const REPORT_REVIEW = gql`
  mutation ReportReview($input: ReportReviewInput!) {
    reportReview(input: $input) {
      id
      isReported
    }
  }
`;
