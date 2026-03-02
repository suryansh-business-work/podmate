import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import * as chatbotService from './chatbot.services';

const chatbotResolvers = {
  Query: {
    chatbotHistory: (_: unknown, args: { limit?: number }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return chatbotService.getChatbotHistory(auth.userId, args.limit ?? 50);
    },
  },

  Mutation: {
    askChatbot: (_: unknown, args: { message: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return chatbotService.askChatbot(auth.userId, args.message);
    },

    clearChatbotHistory: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return chatbotService.clearChatbotHistory(auth.userId);
    },
  },
};

export default chatbotResolvers;
