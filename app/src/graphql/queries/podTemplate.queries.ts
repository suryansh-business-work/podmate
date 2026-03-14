import { gql } from '@apollo/client';

export const GET_ACTIVE_POD_TEMPLATES = gql`
  query GetActivePodTemplates {
    activePodTemplates {
      id
      name
      description
      category
      imageUrl
      defaultTitle
      defaultDescription
      defaultFee
      defaultMaxSeats
      defaultRefundPolicy
    }
  }
`;
