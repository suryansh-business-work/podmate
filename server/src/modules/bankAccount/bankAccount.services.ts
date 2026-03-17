import { v4 as uuidv4 } from 'uuid';
import type {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from './bankAccount.models';
import { BankAccountModel, toBankAccount } from './bankAccount.models';

export async function getBankAccountByUserId(userId: string): Promise<BankAccount | null> {
  const doc = await BankAccountModel.findOne({ userId }).lean({ virtuals: true });
  return toBankAccount(doc);
}

export async function addBankAccount(
  userId: string,
  input: CreateBankAccountInput,
): Promise<BankAccount> {
  const existing = await BankAccountModel.findOne({ userId });
  if (existing) {
    throw new Error('User already has a bank account. Only one bank account is allowed.');
  }
  const doc = await BankAccountModel.create({
    _id: uuidv4(),
    userId,
    accountHolderName: input.accountHolderName,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    ifscCode: input.ifscCode,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return toBankAccount(doc.toObject({ virtuals: true })) as BankAccount;
}

export async function updateBankAccount(
  userId: string,
  input: UpdateBankAccountInput,
): Promise<BankAccount> {
  const existing = await BankAccountModel.findOne({ userId });
  if (!existing) {
    throw new Error('No bank account found for this user');
  }
  const updated = await BankAccountModel.findOneAndUpdate(
    { userId },
    { $set: { ...input, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  return toBankAccount(updated) as BankAccount;
}

export async function deleteBankAccount(userId: string): Promise<boolean> {
  const existing = await BankAccountModel.findOne({ userId });
  if (!existing) {
    throw new Error('No bank account found for this user');
  }
  await BankAccountModel.deleteOne({ userId });
  return true;
}
