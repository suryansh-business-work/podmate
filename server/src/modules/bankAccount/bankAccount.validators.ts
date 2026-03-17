import type { CreateBankAccountInput, UpdateBankAccountInput } from './bankAccount.models';

export function validateCreateBankAccount(input: CreateBankAccountInput): CreateBankAccountInput {
  if (!input.accountHolderName || input.accountHolderName.trim().length < 2) {
    throw new Error('Account holder name must be at least 2 characters');
  }
  if (!input.bankName || input.bankName.trim().length < 2) {
    throw new Error('Bank name must be at least 2 characters');
  }
  if (!input.accountNumber || input.accountNumber.trim().length < 8) {
    throw new Error('Account number must be at least 8 characters');
  }
  if (!/^[0-9]+$/.test(input.accountNumber.trim())) {
    throw new Error('Account number must contain only digits');
  }
  if (!input.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(input.ifscCode.trim().toUpperCase())) {
    throw new Error('Invalid IFSC code format');
  }
  return {
    accountHolderName: input.accountHolderName.trim(),
    bankName: input.bankName.trim(),
    accountNumber: input.accountNumber.trim(),
    ifscCode: input.ifscCode.trim().toUpperCase(),
  };
}

export function validateUpdateBankAccount(input: UpdateBankAccountInput): UpdateBankAccountInput {
  const cleaned: UpdateBankAccountInput = {};
  if (input.accountHolderName !== undefined) {
    if (input.accountHolderName.trim().length < 2) {
      throw new Error('Account holder name must be at least 2 characters');
    }
    cleaned.accountHolderName = input.accountHolderName.trim();
  }
  if (input.bankName !== undefined) {
    if (input.bankName.trim().length < 2) {
      throw new Error('Bank name must be at least 2 characters');
    }
    cleaned.bankName = input.bankName.trim();
  }
  if (input.accountNumber !== undefined) {
    if (input.accountNumber.trim().length < 8) {
      throw new Error('Account number must be at least 8 characters');
    }
    if (!/^[0-9]+$/.test(input.accountNumber.trim())) {
      throw new Error('Account number must contain only digits');
    }
    cleaned.accountNumber = input.accountNumber.trim();
  }
  if (input.ifscCode !== undefined) {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(input.ifscCode.trim().toUpperCase())) {
      throw new Error('Invalid IFSC code format');
    }
    cleaned.ifscCode = input.ifscCode.trim().toUpperCase();
  }
  return cleaned;
}
