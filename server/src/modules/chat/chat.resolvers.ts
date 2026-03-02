import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import * as chatService from './chat.services';

const chatResolvers = {
  Query: {
    chatMessages: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      requireAuth(context);
      return chatService.getMessagesForPod(args.podId);
    },
  },

  Mutation: {
    sendMessage: async (_: unknown, args: { podId: string; content: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      const message = await chatService.addMessage(args.podId, auth.userId, args.content);

      // Push to all WebSocket subscribers in this pod room
      const sender = await chatService.resolveSender(auth.userId);
      chatService.broadcast(args.podId, {
        type: 'new_message',
        message: {
          ...message,
          sender: sender ? { id: sender.id, name: sender.name, avatar: sender.avatar } : null,
        },
      });

      return message;
    },
  },

  ChatMessage: {
    sender: (msg: { senderId: string }) => chatService.resolveSender(msg.senderId),
  },
};

export default chatResolvers;
