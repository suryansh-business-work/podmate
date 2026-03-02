export interface ChatbotScreenProps {
  onBack: () => void;
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AskChatbotResult {
  askChatbot: {
    reply: string;
    messageId: string;
  };
}

export interface ChatbotHistoryResult {
  chatbotHistory: ChatbotMessage[];
}
