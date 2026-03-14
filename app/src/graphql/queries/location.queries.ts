import { gql } from '@apollo/client';

export const GET_ACTIVE_CITIES = gql`
  query GetActiveCities {
    activeCities {
      id
      name
      imageUrl
      clubCount
      isTopCity
      areas {
        id
        name
      }
    }
  }
`;

export const GET_TOP_CITIES = gql`
  query GetTopCities {
    topCities {
      id
      name
      imageUrl
      clubCount
      isTopCity
      areas {
        id
        name
      }
    }
  }
`;
