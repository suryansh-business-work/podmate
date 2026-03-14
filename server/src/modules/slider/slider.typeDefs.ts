const sliderTypeDefs = `#graphql
  type Slider {
    id: ID!
    title: String!
    subtitle: String!
    imageUrl: String!
    ctaText: String!
    ctaLink: String!
    category: String!
    locationCity: String!
    sortOrder: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedSliders {
    items: [Slider!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreateSliderInput {
    title: String!
    subtitle: String
    imageUrl: String!
    ctaText: String
    ctaLink: String
    category: String
    locationCity: String
    sortOrder: Int
    isActive: Boolean
  }

  input UpdateSliderInput {
    title: String
    subtitle: String
    imageUrl: String
    ctaText: String
    ctaLink: String
    category: String
    locationCity: String
    sortOrder: Int
    isActive: Boolean
  }
`;

export default sliderTypeDefs;
