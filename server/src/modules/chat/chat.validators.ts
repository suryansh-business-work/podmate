export function validateMessageContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Message content cannot be empty');
  if (trimmed.length > 2000) throw new Error('Message content is too long (max 2000 characters)');
  return trimmed;
}
