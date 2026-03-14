import { gql } from '@apollo/client';

export const GET_ACTIVE_CATEGORIES = gql`
  query GetActiveCategories {
    activeCategories {
      id
      name
      iconUrl
      imageUrl
      subcategories {
        id
        name
      }
    }
  }
`;
