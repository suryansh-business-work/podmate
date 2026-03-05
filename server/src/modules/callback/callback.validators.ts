export function validateCallbackInput(reason: string): void {
  const trimmed = reason.trim();
  if (!trimmed || trimmed.length < 5) {
    throw new Error('Reason must be at least 5 characters');
  }
  if (trimmed.length > 500) {
    throw new Error('Reason must not exceed 500 characters');
  }
}
