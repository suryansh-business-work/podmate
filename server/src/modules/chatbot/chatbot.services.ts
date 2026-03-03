import { v4 as uuidv4 } from 'uuid';
import type { ChatbotMessage, ChatbotResponse } from './chatbot.models';
import { ChatbotMessageModel, toChatbotMessage } from './chatbot.models';
import { getConfigValue } from '../settings/settings.services';
import logger from '../../lib/logger';

interface OpenAiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function askChatbot(userId: string, message: string): Promise<ChatbotResponse> {
  const apiKey = await getConfigValue('openai_api_key', 'OPENAI_API_KEY');
  const model = await getConfigValue('openai_model', 'OPENAI_MODEL') || 'gpt-4o-mini';
  const prePrompt = await getConfigValue('chatbot_pre_prompt', 'CHATBOT_PRE_PROMPT') ||
    'You are PartyWings assistant. Help users with questions about events, pods, places, and the PartyWings platform. Be friendly and concise.';

  if (!apiKey) {
    throw new Error('AI chatbot is not configured. Please set up OpenAI API key in settings.');
  }

  /* Get recent conversation history BEFORE saving current message (last 10 messages) */
  const history = await ChatbotMessageModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean({ virtuals: true });

  /* Save user message */
  await ChatbotMessageModel.create({
    _id: uuidv4(),
    userId,
    role: 'user',
    content: message,
    createdAt: new Date().toISOString(),
  });

  const messages: OpenAiMessage[] = [
    { role: 'system', content: prePrompt },
    ...history.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: message },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_completion_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('OpenAI API error:', errorBody);
      let detail = `OpenAI API error: ${response.status}`;
      try {
        const parsed = JSON.parse(errorBody) as { error?: { message?: string } };
        if (parsed.error?.message) detail = parsed.error.message;
      } catch { /* use default */ }
      throw new Error(detail);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const assistantContent = data.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    /* Save assistant message */
    await ChatbotMessageModel.create({
      _id: uuidv4(),
      userId,
      role: 'assistant',
      content: assistantContent,
      createdAt: new Date().toISOString(),
    });

    return {
      message: assistantContent,
      conversationId: userId,
    };
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Chatbot error:', errMessage);
    throw new Error(`Chatbot unavailable: ${errMessage}`);
  }
}

export async function getChatbotHistory(userId: string, limit: number): Promise<ChatbotMessage[]> {
  const docs = await ChatbotMessageModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });
  return docs.reverse().map(toChatbotMessage).filter(Boolean) as ChatbotMessage[];
}

export async function clearChatbotHistory(userId: string): Promise<boolean> {
  const result = await ChatbotMessageModel.deleteMany({ userId });
  return result.deletedCount > 0;
}
