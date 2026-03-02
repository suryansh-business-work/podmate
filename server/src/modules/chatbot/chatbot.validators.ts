export function validateChatbotMessage(message: string): void {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  if (message.length > 2000) {
    throw new Error('Message must be less than 2000 characters');
  }
}
