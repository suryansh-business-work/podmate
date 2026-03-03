export interface AiConfig {
  apiKey: string;
  model: string;
  prePrompt: string;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  apiKey: '',
  model: 'gpt-4o-mini',
  prePrompt: 'You are PartyWings assistant. Help users with questions about events, pods, places, and the PartyWings platform. Be friendly and concise.',
};
