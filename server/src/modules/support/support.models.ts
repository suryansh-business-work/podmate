import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketReplySenderRole = 'USER' | 'ADMIN';

export interface TicketReply {
  id: string;
  senderId: string;
  senderRole: TicketReplySenderRole;
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  adminReply: string;
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportTicketInput {
  subject: string;
  message: string;
  priority?: SupportTicketPriority;
}

export interface UpdateSupportTicketInput {
  status?: SupportTicketStatus;
  adminReply?: string;
  priority?: SupportTicketPriority;
}

/* ── Mongoose ── */

export type SupportTicketMongoDoc = Omit<SupportTicket, 'id'> & { _id: string };

const TicketReplySchema = new Schema<TicketReply>(
  {
    id: { type: String, default: () => uuidv4() },
    senderId: { type: String, required: true },
    senderRole: { type: String, enum: ['USER', 'ADMIN'], required: true },
    content: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
);

const SupportTicketSchema = new Schema<SupportTicketMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    adminReply: { type: String, default: '' },
    replies: { type: [TicketReplySchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const SupportTicketModel =
  (mongoose.models['SupportTicket'] as mongoose.Model<SupportTicketMongoDoc> | undefined) ??
  model<SupportTicketMongoDoc>('SupportTicket', SupportTicketSchema);

export function toSupportTicket(
  doc: (SupportTicketMongoDoc & { id?: string }) | null,
): SupportTicket | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    replies: doc.replies ?? [],
  } as SupportTicket;
}
