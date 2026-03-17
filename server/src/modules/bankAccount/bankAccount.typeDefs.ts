const bankAccountTypeDefs = `#graphql
  type BankAccount {
    id: ID!
    userId: ID!
    accountHolderName: String!
    bankName: String!
    accountNumber: String!
    ifscCode: String!
    isVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input AddBankAccountInput {
    accountHolderName: String!
    bankName: String!
    accountNumber: String!
    ifscCode: String!
  }

  input UpdateBankAccountInput {
    accountHolderName: String
    bankName: String
    accountNumber: String
    ifscCode: String
  }
`;

export default bankAccountTypeDefs;
