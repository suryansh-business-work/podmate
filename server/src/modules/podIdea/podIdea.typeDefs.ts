const podIdeaTypeDefs = `#graphql
  enum PodIdeaStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type PodIdea {
    id: ID!
    userId: ID!
    user: User!
    title: String!
    description: String!
    category: String!
    location: String
    estimatedBudget: String
    status: PodIdeaStatus!
    adminNotes: String
    upvoteCount: Int!
    hasUpvoted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedPodIdeas {
    items: [PodIdea!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreatePodIdeaInput {
    title: String!
    description: String!
    category: String!
    location: String
    estimatedBudget: String
  }

  input UpdatePodIdeaInput {
    status: PodIdeaStatus
    adminNotes: String
  }
`;

export default podIdeaTypeDefs;
