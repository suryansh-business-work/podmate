import { gql } from '@apollo/client';

export const GET_MY_BANK_ACCOUNT = gql`
  query GetMyBankAccount {
    myBankAccount {
      id
      accountHolderName
      bankName
      accountNumber
      ifscCode
      isVerified
      createdAt
      updatedAt
    }
  }
`;
