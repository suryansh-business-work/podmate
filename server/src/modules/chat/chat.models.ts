export interface ChatMessage {
  id: string;
  podId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatRoom {
  podId: string;
  messages: ChatMessage[];
}
