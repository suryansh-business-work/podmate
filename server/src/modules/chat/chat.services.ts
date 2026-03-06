import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage, ChatMessageType } from './chat.models';
import { ChatMessageModel, toChatMessage } from './chat.models';
import type { User } from '../user/user.models';
import { findUserById } from '../user/user.services';

export async function getMessagesForPod(podId: string): Promise<ChatMessage[]> {
  const docs = await ChatMessageModel.find({ podId })
    .sort({ createdAt: 1 })
    .lean({ virtuals: true });
  return docs.map(toChatMessage).filter(Boolean) as ChatMessage[];
}

export async function addMessage(
  podId: string,
  senderId: string,
  content: string,
  messageType: ChatMessageType = 'TEXT',
  mediaUrl = '',
): Promise<ChatMessage> {
  const doc = await ChatMessageModel.create({
    _id: uuidv4(),
    podId,
    senderId,
    content,
    messageType,
    mediaUrl,
    createdAt: new Date().toISOString(),
  });
  return toChatMessage(doc.toObject({ virtuals: true })) as ChatMessage;
}

export async function resolveSender(senderId: string): Promise<User | null> {
  return findUserById(senderId);
}

/* ── Broadcast hook (set by index.ts once WS server is ready) ── */
type BroadcastFn = (podId: string, payload: Record<string, unknown>) => void;
let broadcastFn: BroadcastFn | undefined;

export function setBroadcast(fn: BroadcastFn): void {
  broadcastFn = fn;
}

export function broadcast(podId: string, payload: Record<string, unknown>): void {
  broadcastFn?.(podId, payload);
}
