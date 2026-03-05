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

export interface ChatRoomProps {
  pod: Pod;
  onBack: () => void;
}

export interface MessageBubbleProps {
  item: ChatMessage;
  isMe: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
  onPreviewMedia: (uri: string, type: 'IMAGE' | 'VIDEO') => void;
}

export interface MediaPreviewProps {
  visible: boolean;
  uri: string;
  type: 'IMAGE' | 'VIDEO';
  onClose: () => void;
}

export interface ChatInputBarProps {
  value: string;
  sending: boolean;
  uploading: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onSendImage: () => void;
  onSendVideo: () => void;
}
