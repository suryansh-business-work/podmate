import { gql } from '@apollo/client';

export const GET_ACTIVE_SLIDERS = gql`
  query GetActiveSliders($city: String) {
    activeSliders(city: $city) {
      id
      title
      subtitle
      imageUrl
      ctaText
      ctaLink
      category
      locationCity
      sortOrder
    }
  }
`;
