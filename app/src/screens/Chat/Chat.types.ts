export interface Pod {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  status: string;
}

export interface ChatMessageSender {
  id: string;
  name: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  podId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  createdAt: string;
  sender: ChatMessageSender;
}
