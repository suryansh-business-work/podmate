import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  podId: string;
  senderId: string;
  content: string;
  messageType: ChatMessageType;
  mediaUrl: string;
  createdAt: string;
}

export interface ChatRoom {
  podId: string;
  messages: ChatMessage[];
}

/* ── Mongoose ── */

export type ChatMessageMongoDoc = Omit<ChatMessage, 'id'> & { _id: string };

const ChatMessageSchema = new Schema<ChatMessageMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    podId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    content: { type: String, default: '' },
    messageType: { type: String, enum: ['TEXT', 'IMAGE', 'VIDEO', 'SYSTEM'], default: 'TEXT' },
    mediaUrl: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const ChatMessageModel =
  (mongoose.models['ChatMessage'] as mongoose.Model<ChatMessageMongoDoc> | undefined) ??
  model<ChatMessageMongoDoc>('ChatMessage', ChatMessageSchema);

export function toChatMessage(
  doc: (ChatMessageMongoDoc & { id?: string }) | null,
): ChatMessage | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    content: doc.content ?? '',
    mediaUrl: doc.mediaUrl ?? '',
  } as ChatMessage;
}
