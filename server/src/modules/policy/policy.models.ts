import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Policy {
  id: string;
  type: PolicyType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PolicyType = 'VENUE' | 'USER' | 'HOST';

export interface CreatePolicyInput {
  type: PolicyType;
  title: string;
  content: string;
}

export interface UpdatePolicyInput {
  title?: string;
  content?: string;
  isActive?: boolean;
}

/* ── Mongoose ── */

export type PolicyMongoDoc = Omit<Policy, 'id'> & { _id: string };

const PolicySchema = new Schema<PolicyMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    type: { type: String, enum: ['VENUE', 'USER', 'HOST'], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PolicyModel =
  (mongoose.models['Policy'] as mongoose.Model<PolicyMongoDoc> | undefined) ??
  model<PolicyMongoDoc>('Policy', PolicySchema);

export function toPolicy(doc: (PolicyMongoDoc & { id?: string }) | null): Policy | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as Policy;
}
