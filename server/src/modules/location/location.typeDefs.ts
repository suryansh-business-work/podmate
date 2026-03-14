const locationTypeDefs = `#graphql
  type City {
    id: ID!
    name: String!
    state: String!
    country: String!
    imageUrl: String!
    clubCount: Int!
    isTopCity: Boolean!
    isActive: Boolean!
    sortOrder: Int!
    areas: [Area!]!
    createdAt: String!
    updatedAt: String!
  }

  type Area {
    id: ID!
    name: String!
    cityId: ID!
  }

  type PaginatedCities {
    items: [City!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreateCityInput {
    name: String!
    state: String
    country: String
    imageUrl: String
    isTopCity: Boolean
    isActive: Boolean
    sortOrder: Int
  }

  input UpdateCityInput {
    name: String
    state: String
    country: String
    imageUrl: String
    clubCount: Int
    isTopCity: Boolean
    isActive: Boolean
    sortOrder: Int
  }

  input CreateAreaInput {
    name: String!
    cityId: ID!
  }
`;

export default locationTypeDefs;
