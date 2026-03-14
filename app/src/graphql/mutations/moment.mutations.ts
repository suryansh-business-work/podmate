import { gql } from '@apollo/client';

export const CREATE_MOMENT = gql`
  mutation CreateMoment($input: CreateMomentInput!) {
    createMoment(input: $input) {
      id
      caption
      mediaUrls
      likeCount
      commentCount
      isLiked
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;

export const DELETE_MOMENT = gql`
  mutation DeleteMoment($id: ID!) {
    deleteMoment(id: $id)
  }
`;

export const LIKE_MOMENT = gql`
  mutation LikeMoment($momentId: ID!) {
    likeMoment(momentId: $momentId) {
      id
      likeCount
      isLiked
    }
  }
`;

export const UNLIKE_MOMENT = gql`
  mutation UnlikeMoment($momentId: ID!) {
    unlikeMoment(momentId: $momentId) {
      id
      likeCount
      isLiked
    }
  }
`;

export const ADD_MOMENT_COMMENT = gql`
  mutation AddMomentComment($momentId: ID!, $content: String!) {
    addMomentComment(momentId: $momentId, content: $content) {
      id
      momentId
      content
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;
