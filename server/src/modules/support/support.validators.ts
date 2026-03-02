export function validateSupportTicketInput(subject: string, message: string): void {
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  if (!trimmedSubject || trimmedSubject.length < 3) {
    throw new Error('Subject must be at least 3 characters');
  }
  if (trimmedSubject.length > 200) {
    throw new Error('Subject must not exceed 200 characters');
  }
  if (!trimmedMessage || trimmedMessage.length < 10) {
    throw new Error('Message must be at least 10 characters');
  }
  if (trimmedMessage.length > 5000) {
    throw new Error('Message must not exceed 5000 characters');
  }
}
