import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from './chat.models';
import { findUserById } from '../user/user.services';

const chatMessages: Map<string, ChatMessage[]> = new Map();

// Seed some chat messages
const seedMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    podId: 'pod-1',
    senderId: 'user-4',
    content: 'See you all on Saturday!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    podId: 'pod-2',
    senderId: 'user-2',
    content: "Don't forget sunscreen 🧴",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    podId: 'pod-1',
    senderId: 'user-1',
    content: 'Can we bring our own sake?',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

seedMessages.forEach((msg) => {
  const existing = chatMessages.get(msg.podId) ?? [];
  existing.push(msg);
  chatMessages.set(msg.podId, existing);
});

export function getMessagesForPod(podId: string): ChatMessage[] {
  return chatMessages.get(podId) ?? [];
}

export function addMessage(podId: string, senderId: string, content: string): ChatMessage {
  const message: ChatMessage = {
    id: uuidv4(),
    podId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
  };
  const existing = chatMessages.get(podId) ?? [];
  existing.push(message);
  chatMessages.set(podId, existing);
  return message;
}

export function resolveSender(senderId: string) {
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
