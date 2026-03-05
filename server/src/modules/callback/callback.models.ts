import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CallbackRequestStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface CallbackRequest {
  id: string;
  userId: string;
  phone: string;
  reason: string;
  preferredTime: string;
  status: CallbackRequestStatus;
  adminNote: string;
  scheduledAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCallbackRequestInput {
  reason: string;
  preferredTime?: string;
}

export interface UpdateCallbackRequestInput {
  status?: CallbackRequestStatus;
  adminNote?: string;
  scheduledAt?: string;
}

export type CallbackRequestMongoDoc = Omit<CallbackRequest, 'id'> & { _id: string };

const CallbackRequestSchema = new Schema<CallbackRequestMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    reason: { type: String, required: true },
    preferredTime: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    adminNote: { type: String, default: '' },
    scheduledAt: { type: String, default: '' },
    completedAt: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const CallbackRequestModel =
  (mongoose.models['CallbackRequest'] as mongoose.Model<CallbackRequestMongoDoc> | undefined) ??
  model<CallbackRequestMongoDoc>('CallbackRequest', CallbackRequestSchema);

export function toCallbackRequest(
  doc: (CallbackRequestMongoDoc & { id?: string }) | null,
): CallbackRequest | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as CallbackRequest;
}
