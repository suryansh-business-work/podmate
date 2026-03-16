const locationTypeDefs = `#graphql
  type City {
    id: ID!
    name: String!
    state: String!
    country: String!
    imageUrl: String!
    clubCount: Int!
    podCount: Int!
    isTopCity: Boolean!
    isActive: Boolean!
    sortOrder: Int!
    pincodes: [String!]!
    areas: [Area!]!
    createdAt: String!
    updatedAt: String!
  }

  type Area {
    id: ID!
    name: String!
    cityId: ID!
    pincodes: [String!]!
  }

  type PaginatedCities {
    items: [City!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type ResolvedLocation {
    city: String!
    state: String!
    country: String!
    pincode: String!
    area: String!
    address: String!
    latitude: Float!
    longitude: Float!
    matchedCityId: ID
    matchedCityName: String
    matchedAreaId: ID
    matchedAreaName: String
    isServiceAvailable: Boolean!
  }

  type GooglePlacePrediction {
    placeId: String!
    description: String!
    mainText: String!
    secondaryText: String!
  }

  input CreateCityInput {
    name: String!
    state: String
    country: String
    imageUrl: String
    isTopCity: Boolean
    isActive: Boolean
    sortOrder: Int
    pincodes: [String!]
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
    pincodes: [String!]
  }

  input CreateAreaInput {
    name: String!
    cityId: ID!
    pincodes: [String!]
  }
`;

export default locationTypeDefs;
