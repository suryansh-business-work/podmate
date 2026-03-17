import { gql } from '@apollo/client';

export const ADD_BANK_ACCOUNT = gql`
  mutation AddBankAccount($input: AddBankAccountInput!) {
    addBankAccount(input: $input) {
      id
      accountHolderName
      bankName
      accountNumber
      ifscCode
      isVerified
    }
  }
`;

export const UPDATE_BANK_ACCOUNT = gql`
  mutation UpdateBankAccount($input: UpdateBankAccountInput!) {
    updateBankAccount(input: $input) {
      id
      accountHolderName
      bankName
      accountNumber
      ifscCode
      isVerified
    }
  }
`;

export const DELETE_BANK_ACCOUNT = gql`
  mutation DeleteBankAccount {
    deleteBankAccount
  }
`;
