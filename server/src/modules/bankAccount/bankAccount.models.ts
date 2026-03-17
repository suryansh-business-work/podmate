import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface BankAccount {
  id: string;
  userId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountInput {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface UpdateBankAccountInput {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export type BankAccountMongoDoc = Omit<BankAccount, 'id'> & { _id: string };

const BankAccountSchema = new Schema<BankAccountMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, unique: true, index: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const BankAccountModel =
  (mongoose.models['BankAccount'] as mongoose.Model<BankAccountMongoDoc> | undefined) ??
  model<BankAccountMongoDoc>('BankAccount', BankAccountSchema);

export function toBankAccount(
  doc: (BankAccountMongoDoc & { id?: string }) | null,
): BankAccount | null {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id,
    userId: doc.userId,
    accountHolderName: doc.accountHolderName,
    bankName: doc.bankName,
    accountNumber: doc.accountNumber,
    ifscCode: doc.ifscCode,
    isVerified: doc.isVerified,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
