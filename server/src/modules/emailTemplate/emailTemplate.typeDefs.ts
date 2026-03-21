const typeDefs = `#graphql
  type TemplateVariable {
    key: String!
    description: String!
    defaultValue: String!
    required: Boolean!
  }

  type EmailTemplate {
    id: ID!
    slug: String!
    name: String!
    subject: String!
    mjmlBody: String!
    variables: [TemplateVariable!]!
    category: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedEmailTemplates {
    items: [EmailTemplate!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type MjmlValidationError {
    line: Int!
    message: String!
    tagName: String!
  }

  type MjmlValidationResult {
    valid: Boolean!
    html: String!
    errors: [MjmlValidationError!]!
  }

  type TemplatePreviewResult {
    html: String!
    errors: [MjmlValidationError!]!
  }

  type TemplateRenderResult {
    html: String!
    text: String!
  }

  input TemplateVariableInput {
    key: String!
    description: String!
    defaultValue: String!
    required: Boolean!
  }

  input CreateEmailTemplateInput {
    slug: String!
    name: String!
    subject: String!
    mjmlBody: String!
    variables: [TemplateVariableInput!]!
    category: String!
  }

  input UpdateEmailTemplateInput {
    name: String
    subject: String
    mjmlBody: String
    variables: [TemplateVariableInput!]
    category: String
    isActive: Boolean
  }
`;

export default typeDefs;
