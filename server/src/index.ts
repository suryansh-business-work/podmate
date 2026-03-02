import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import type { GraphQLContext } from './modules/auth/auth.models';
import { getUserFromRequest, verifyToken } from './modules/auth/auth.services';
import userTypeDefs from './modules/user/user.typeDefs';
import podTypeDefs from './modules/pod/pod.typeDefs';
import authTypeDefs from './modules/auth/auth.typeDefs';
import chatTypeDefs from './modules/chat/chat.typeDefs';
import userResolvers from './modules/user/user.resolvers';
import podResolvers from './modules/pod/pod.resolvers';
import authResolvers from './modules/auth/auth.resolvers';
import chatResolvers from './modules/chat/chat.resolvers';
import * as chatService from './modules/chat/chat.services';
import inviteTypeDefs from './modules/invite/invite.typeDefs';
import inviteResolvers from './modules/invite/invite.resolvers';
import policyTypeDefs from './modules/policy/policy.typeDefs';
import policyResolvers from './modules/policy/policy.resolvers';
import logger from './lib/logger';

const PORT = parseInt(process.env.PORT ?? '4039', 10);

const rootSchema = `#graphql
  type Query {
    me: User
    users(page: Int, limit: Int, search: String, sortBy: String, order: String): PaginatedUsers!
    pods(category: String, page: Int, limit: Int, search: String, sortBy: String, order: String): PaginatedPods!
    pod(id: ID!): Pod
    myPods: [Pod!]!
    chatMessages(podId: ID!): [ChatMessage!]!
    podInvites(podId: ID!): [Invite!]!
    policies(type: String): [Policy!]!
    dashboardStats: DashboardStats!
  }

  type Mutation {
    sendOtp(phone: String!): OtpResponse!
    verifyOtp(phone: String!, otp: String!): AuthPayload!
    adminLogin(email: String!, password: String!): AdminAuthPayload!
    sendAdminCredentials(email: String!): SendCredentialsResponse!
    completeProfile(name: String!, age: Int!): User!
    createPod(input: CreatePodInput!): Pod!
    updatePod(id: ID!, input: UpdatePodInput!): Pod!
    deletePod(id: ID!): Boolean!
    joinPod(podId: ID!): Pod!
    leavePod(podId: ID!): Pod!
    updateProfile(name: String, avatar: String): User!
    updateUserRole(userId: ID!, role: UserRole!): User!
    getImageKitAuth: ImageKitAuth!
    sendMessage(podId: ID!, content: String!): ChatMessage!
    sendInvites(podId: ID!, contacts: [InviteInput!]!): InviteResult!
    createPolicy(input: CreatePolicyInput!): Policy!
    updatePolicy(id: ID!, input: UpdatePolicyInput!): Policy!
    deletePolicy(id: ID!): Boolean!
  }
`;

const typeDefs = [rootSchema, userTypeDefs, podTypeDefs, authTypeDefs, chatTypeDefs, inviteTypeDefs, policyTypeDefs];

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...podResolvers.Query,
    ...chatResolvers.Query,
    ...inviteResolvers.Query,
    ...policyResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...podResolvers.Mutation,
    ...authResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...inviteResolvers.Mutation,
    ...policyResolvers.Mutation,
  },
  Pod: podResolvers.Pod,
  ChatMessage: chatResolvers.ChatMessage,
};

/* ── WebSocket connection registry ── */
interface WsClient {
  ws: WebSocket;
  userId: string;
  podId: string;
}
const wsClients: WsClient[] = [];

function broadcastToPod(podId: string, payload: Record<string, unknown>): void {
  const msg = JSON.stringify(payload);
  for (const c of wsClients) {
    if (c.podId === podId && c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(msg);
    }
  }
}

// Expose broadcast so chat resolvers can push messages
chatService.setBroadcast(broadcastToPod);

async function main(): Promise<void> {
  const app = express();

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'partywings-server', port: PORT });
  });

  app.use(
    '/graphql',
    expressMiddleware<GraphQLContext>(server, {
      context: async ({ req }) => ({
        user: getUserFromRequest(req),
      }),
    }),
  );

  const httpServer = createServer(app);

  /* ── WebSocket server for real-time chat ── */
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    let clientEntry: WsClient | undefined;

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString()) as Record<string, string>;

        /* Authenticate & join a pod room */
        if (data.type === 'join') {
          const user = verifyToken(data.token ?? '');
          if (!user) {
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
            ws.close();
            return;
          }
          clientEntry = { ws, userId: user.userId, podId: data.podId ?? '' };
          wsClients.push(clientEntry);
          ws.send(JSON.stringify({ type: 'joined', podId: data.podId }));
        }
      } catch {
        /* ignore malformed messages */
      }
    });

    ws.on('close', () => {
      if (clientEntry) {
        const idx = wsClients.indexOf(clientEntry);
        if (idx !== -1) wsClients.splice(idx, 1);
      }
    });
  });

  httpServer.listen(PORT, () => {
    logger.info(`PartyWings Server ready at http://localhost:${PORT}/graphql`);
    logger.info(`WebSocket ready at ws://localhost:${PORT}/ws`);
  });
}

main().catch((err: Error) => {
  logger.error('Server failed to start:', err);
  process.exit(1);
});
