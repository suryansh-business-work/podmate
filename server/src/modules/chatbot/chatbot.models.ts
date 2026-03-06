import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ChatbotMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatbotResponse {
  reply: string;
  messageId: string;
}

/* ── Mongoose ── */

export type ChatbotMessageMongoDoc = Omit<ChatbotMessage, 'id'> & { _id: string };

const ChatbotMessageSchema = new Schema<ChatbotMessageMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const ChatbotMessageModel =
  (mongoose.models['ChatbotMessage'] as mongoose.Model<ChatbotMessageMongoDoc> | undefined) ??
  model<ChatbotMessageMongoDoc>('ChatbotMessage', ChatbotMessageSchema);

export function toChatbotMessage(
  doc: (ChatbotMessageMongoDoc & { id?: string }) | null,
): ChatbotMessage | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as ChatbotMessage;
}
