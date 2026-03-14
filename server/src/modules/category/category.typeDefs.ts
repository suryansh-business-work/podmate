const categoryTypeDefs = `#graphql
  type Category {
    id: ID!
    name: String!
    description: String!
    iconUrl: String!
    imageUrl: String!
    isActive: Boolean!
    sortOrder: Int!
    subcategories: [SubCategory!]!
    createdAt: String!
    updatedAt: String!
  }

  type SubCategory {
    id: ID!
    name: String!
    description: String!
    imageUrl: String!
    categoryId: ID!
    isActive: Boolean!
    sortOrder: Int!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedCategories {
    items: [Category!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreateCategoryInput {
    name: String!
    description: String
    iconUrl: String!
    imageUrl: String
    isActive: Boolean
    sortOrder: Int
  }

  input UpdateCategoryInput {
    name: String
    description: String
    iconUrl: String
    imageUrl: String
    isActive: Boolean
    sortOrder: Int
  }

  input CreateSubCategoryInput {
    categoryId: ID!
    name: String!
    description: String
    imageUrl: String
    isActive: Boolean
    sortOrder: Int
  }

  input UpdateSubCategoryInput {
    name: String
    description: String
    imageUrl: String
    isActive: Boolean
    sortOrder: Int
  }
`;

export default categoryTypeDefs;
