const placeTypeDefs = `#graphql
  enum PlaceStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type Place {
    id: ID!
    name: String!
    description: String!
    address: String!
    city: String!
    imageUrl: String!
    mediaUrls: [String!]!
    owner: User
    category: String!
    phone: String!
    email: String!
    latitude: Float!
    longitude: Float!
    status: PlaceStatus!
    isVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedPlaces {
    items: [Place!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreatePlaceInput {
    name: String!
    description: String!
    address: String!
    city: String!
    imageUrl: String
    mediaUrls: [String!]
    category: String!
    phone: String
    email: String
    latitude: Float
    longitude: Float
  }

  input UpdatePlaceInput {
    name: String
    description: String
    address: String
    city: String
    imageUrl: String
    mediaUrls: [String!]
    category: String
    phone: String
    email: String
    latitude: Float
    longitude: Float
  }
`;

export default placeTypeDefs;
