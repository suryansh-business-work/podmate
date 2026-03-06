import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { expressMiddleware } from '@apollo/server/express4';
import type { GraphQLContext } from './modules/auth/auth.models';
import { getUserFromRequest, verifyToken } from './modules/auth/auth.services';
import { uploadToImageKit } from './lib/imagekit';
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
import placeTypeDefs from './modules/place/place.typeDefs';
import placeResolvers from './modules/place/place.resolvers';
import supportTypeDefs from './modules/support/support.typeDefs';
import supportResolvers from './modules/support/support.resolvers';
import settingsTypeDefs from './modules/settings/settings.typeDefs';
import settingsResolvers from './modules/settings/settings.resolvers';
import featureFlagTypeDefs from './modules/featureFlag/featureFlag.typeDefs';
import featureFlagResolvers from './modules/featureFlag/featureFlag.resolvers';
import paymentTypeDefs from './modules/payment/payment.typeDefs';
import paymentResolvers from './modules/payment/payment.resolvers';
import chatbotTypeDefs from './modules/chatbot/chatbot.typeDefs';
import chatbotResolvers from './modules/chatbot/chatbot.resolvers';
import notificationTypeDefs from './modules/notification/notification.typeDefs';
import notificationResolvers from './modules/notification/notification.resolvers';
import platformFeeTypeDefs from './modules/platformFee/platformFee.typeDefs';
import platformFeeResolvers from './modules/platformFee/platformFee.resolvers';
import reviewTypeDefs from './modules/review/review.typeDefs';
import reviewResolvers from './modules/review/review.resolvers';
import followTypeDefs from './modules/follow/follow.typeDefs';
import followResolvers from './modules/follow/follow.resolvers';
import feedbackTypeDefs from './modules/feedback/feedback.typeDefs';
import feedbackResolvers from './modules/feedback/feedback.resolvers';
import podIdeaTypeDefs from './modules/podIdea/podIdea.typeDefs';
import podIdeaResolvers from './modules/podIdea/podIdea.resolvers';
import goLiveTypeDefs from './modules/goLive/goLive.typeDefs';
import goLiveResolvers from './modules/goLive/goLive.resolvers';
import callbackTypeDefs from './modules/callback/callback.typeDefs';
import callbackResolvers from './modules/callback/callback.resolvers';
import pushNotificationTypeDefs from './modules/pushNotification/pushNotification.typeDefs';
import pushNotificationResolvers from './modules/pushNotification/pushNotification.resolvers';
import logger from './lib/logger';
import { connectDB } from './lib/db';

const PORT = parseInt(process.env.PORT ?? '4039', 10);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/* ── Rate limiting configuration ── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_PRODUCTION ? 200 : 1000, // stricter in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const rootSchema = `#graphql
  type Query {
    me: User
    user(id: ID!): User
    userProfile(userId: ID!): User
    users(page: Int, limit: Int, search: String, sortBy: String, order: String): PaginatedUsers!
    pods(category: String, page: Int, limit: Int, search: String, sortBy: String, order: String): PaginatedPods!
    pod(id: ID!): Pod
    myPods: [Pod!]!
    userPods(userId: ID!): [Pod!]!
    userHostedPods(userId: ID!): [Pod!]!
    userJoinedPods(userId: ID!): [Pod!]!
    chatMessages(podId: ID!): [ChatMessage!]!
    podInvites(podId: ID!): [Invite!]!
    policies(type: String): [Policy!]!
    dashboardStats: DashboardStats!
    places(page: Int, limit: Int, search: String, status: String, sortBy: String, order: String): PaginatedPlaces!
    place(id: ID!): Place
    myPlaces: [Place!]!
    approvedPlaces(search: String): [Place!]!
    mySupportTickets: [SupportTicket!]!
    supportTicket(id: ID!): SupportTicket
    supportTickets(page: Int, limit: Int, search: String, status: String, priority: String, sortBy: String, order: String): PaginatedSupportTickets!
    supportTicketCounts: SupportTicketCounts!
    appSettings: [AppSetting!]!
    appSettingsByCategory(category: String!): [AppSetting!]!
    appConfig(keys: [String!]!): [AppSetting!]!
    maintenanceMode: Boolean!
    maintenanceStatus: MaintenanceStatus!
    featureFlags(page: Int, limit: Int, search: String): PaginatedFeatureFlags!
    featureFlag(key: String!): FeatureFlag
    isFeatureEnabled(key: String!): Boolean!
    payments(page: Int, limit: Int, search: String, type: String, status: String, userId: ID, podId: ID, sortBy: String, order: String): PaginatedPayments!
    payment(id: ID!): Payment
    paymentStats: PaymentStats!
    myPayments(page: Int, limit: Int): PaginatedPayments!
    chatbotHistory(limit: Int): [ChatbotMessage!]!
    notifications(page: Int, limit: Int): PaginatedNotifications!
    unreadNotificationCount: Int!
    adminNotifications(page: Int, limit: Int): PaginatedAdminNotifications!
    platformFees: PlatformFeeConfig!
    platformFeeOverrides(page: Int, limit: Int): PaginatedPlatformFeeOverrides!
    openAiModels: [String!]!
    reviews(targetType: ReviewTargetType!, targetId: ID!, page: Int, limit: Int): PaginatedReviews!
    reviewStats(targetType: ReviewTargetType!, targetId: ID!): ReviewStats!
    followers(userId: ID!, page: Int, limit: Int): PaginatedFollows!
    following(userId: ID!, page: Int, limit: Int): PaginatedFollows!
    followStats(userId: ID!): FollowStats!
    myFeedback: [Feedback!]!
    allFeedback(page: Int, limit: Int, search: String, status: String): PaginatedFeedback!
    podIdeas(page: Int, limit: Int, category: String): PaginatedPodIdeas!
    myPodIdeas: [PodIdea!]!
    activeLiveSessions(page: Int, limit: Int): PaginatedLiveSessions!
    liveSessionForPod(podId: ID!): LiveSession
    myCallbackRequests: [CallbackRequest!]!
    callbackRequest(id: ID!): CallbackRequest
    callbackRequests(page: Int, limit: Int, search: String, status: String, sortBy: String, order: String): PaginatedCallbackRequests!
    callbackRequestCounts: CallbackRequestCounts!
  }

  type Mutation {
    sendOtp(phone: String!): OtpResponse!
    verifyOtp(phone: String!, otp: String!): AuthPayload!
    adminLogin(email: String!, password: String!): AdminAuthPayload!
    sendAdminCredentials(email: String!): SendCredentialsResponse!
    completeProfile(username: String!, name: String!, dob: String!): User!
    createPod(input: CreatePodInput!): Pod!
    updatePod(id: ID!, input: UpdatePodInput!): Pod!
    deletePod(id: ID!): Boolean!
    joinPod(podId: ID!): Pod!
    checkoutPod(podId: ID!): CheckoutResult!
    leavePod(podId: ID!): Pod!
    closePod(id: ID!, reason: String!): Pod!
    openPod(id: ID!): Pod!
    trackPodView(podId: ID!): Pod!
    removeAttendee(podId: ID!, userId: ID!, issueRefund: Boolean!): RemoveAttendeeResult!
    forceDeletePod(id: ID!, issueRefunds: Boolean!): ForceDeletePodResult!
    bulkDeletePods(ids: [ID!]!, issueRefunds: Boolean!): Int!
    updateProfile(name: String, avatar: String, email: String): User!
    savePod(podId: ID!): User!
    unsavePod(podId: ID!): User!
    updateThemePreference(themePreference: String!): User!
    updateUserRole(userId: ID!, role: UserRole!): User!
    adminCreateUser(phone: String!, name: String!, role: UserRole!): User!
    deleteUser(userId: ID!): Boolean!
    bulkDeleteUsers(ids: [ID!]!): Int!
    getImageKitAuth: ImageKitAuth!
    sendMessage(podId: ID!, content: String!, messageType: ChatMessageType, mediaUrl: String): ChatMessage!
    sendInvites(podId: ID!, contacts: [InviteInput!]!): InviteResult!
    createPolicy(input: CreatePolicyInput!): Policy!
    updatePolicy(id: ID!, input: UpdatePolicyInput!): Policy!
    deletePolicy(id: ID!): Boolean!
    createPlace(input: CreatePlaceInput!): Place!
    adminCreatePlace(input: CreatePlaceInput!, ownerId: ID!): Place!
    updatePlace(id: ID!, input: UpdatePlaceInput!): Place!
    approvePlace(id: ID!): Place!
    rejectPlace(id: ID!): Place!
    deletePlace(id: ID!): Boolean!
    bulkDeletePlaces(ids: [ID!]!): Int!
    createSupportTicket(input: CreateSupportTicketInput!): SupportTicket!
    adminCreateSupportTicket(userId: ID!, input: CreateSupportTicketInput!): SupportTicket!
    replySupportTicket(id: ID!, content: String!, parentReplyId: ID): SupportTicket!
    updateSupportTicket(id: ID!, input: UpdateSupportTicketInput!): SupportTicket!
    deleteSupportTicket(id: ID!): Boolean!
    upsertSetting(input: UpsertSettingInput!): AppSetting!
    upsertBulkSettings(inputs: [UpsertSettingInput!]!): [AppSetting!]!
    deleteSetting(key: String!): Boolean!
    testSmtpConnection: TestConnectionResult!
    testOpenAiConnection: TestConnectionResult!
    testImageKitConnection: TestConnectionResult!
    toggleUserActive(userId: ID!, isActive: Boolean!, reason: String): User!
    createFeatureFlag(input: CreateFeatureFlagInput!): FeatureFlag!
    updateFeatureFlag(id: ID!, input: UpdateFeatureFlagInput!): FeatureFlag!
    deleteFeatureFlag(id: ID!): Boolean!
    toggleFeatureFlag(id: ID!): FeatureFlag!
    createPayment(input: CreatePaymentInput!): Payment!
    processRefund(input: ProcessRefundInput!): Payment!
    completePayment(id: ID!, transactionId: String): Payment!
    askChatbot(message: String!): ChatbotResponse!
    clearChatbotHistory: Boolean!
    markNotificationRead(id: ID!): Boolean!
    markAllNotificationsRead: Boolean!
    sendBroadcastNotification(input: SendBroadcastNotificationInput!): BroadcastNotificationResult!
    upsertPlatformFee(globalFeePercent: Float!): PlatformFeeConfig!
    upsertPlatformFeeOverride(input: UpsertPlatformFeeOverrideInput!): PlatformFeeOverride!
    deletePlatformFeeOverride(id: ID!): Boolean!
    createReview(input: CreateReviewInput!): Review!
    replyToReview(input: ReplyReviewInput!): Review!
    reportReview(input: ReportReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
    followUser(userId: ID!): Follow!
    unfollowUser(userId: ID!): Boolean!
    submitFeedback(input: CreateFeedbackInput!): Feedback!
    updateFeedbackStatus(id: ID!, input: UpdateFeedbackInput!): Feedback!
    deleteFeedback(id: ID!): Boolean!
    submitPodIdea(input: CreatePodIdeaInput!): PodIdea!
    upvotePodIdea(id: ID!): PodIdea!
    removeUpvote(id: ID!): PodIdea!
    updatePodIdea(id: ID!, input: UpdatePodIdeaInput!): PodIdea!
    deletePodIdea(id: ID!): Boolean!
    startLiveSession(input: StartLiveInput!): LiveSession!
    endLiveSession(id: ID!): LiveSession!
    joinLiveSession(id: ID!): LiveSession!
    leaveLiveSession(id: ID!): LiveSession!
    requestCallback(input: CreateCallbackRequestInput!): CallbackRequest!
    updateCallbackRequest(id: ID!, input: UpdateCallbackRequestInput!): CallbackRequest!
    deleteCallbackRequest(id: ID!): Boolean!
    registerPushToken(input: RegisterPushTokenInput!): PushToken!
    unregisterPushToken(deviceId: String!): Boolean!
    adminUpdateUser(userId: ID!, input: AdminUpdateUserInput!): User!
    adminUpdatePod(id: ID!, input: AdminUpdatePodInput!): Pod!
  }

  input AdminUpdateUserInput {
    name: String
    email: String
    phone: String
    username: String
    dob: String
    avatar: String
    role: UserRole
    isVerifiedHost: Boolean
    isActive: Boolean
    disableReason: String
  }

  input AdminUpdatePodInput {
    title: String
    description: String
    category: String
    imageUrl: String
    mediaUrls: [String!]
    feePerPerson: Float
    maxSeats: Int
    dateTime: String
    location: String
    locationDetail: String
    latitude: Float
    longitude: Float
    status: PodStatus
    closeReason: String
    refundPolicy: String
  }
`;

const typeDefs = [
  rootSchema,
  userTypeDefs,
  podTypeDefs,
  authTypeDefs,
  chatTypeDefs,
  inviteTypeDefs,
  policyTypeDefs,
  placeTypeDefs,
  supportTypeDefs,
  settingsTypeDefs,
  featureFlagTypeDefs,
  paymentTypeDefs,
  chatbotTypeDefs,
  notificationTypeDefs,
  platformFeeTypeDefs,
  reviewTypeDefs,
  followTypeDefs,
  feedbackTypeDefs,
  podIdeaTypeDefs,
  goLiveTypeDefs,
  callbackTypeDefs,
  pushNotificationTypeDefs,
];

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...podResolvers.Query,
    ...chatResolvers.Query,
    ...inviteResolvers.Query,
    ...policyResolvers.Query,
    ...placeResolvers.Query,
    ...supportResolvers.Query,
    ...settingsResolvers.Query,
    ...featureFlagResolvers.Query,
    ...paymentResolvers.Query,
    ...chatbotResolvers.Query,
    ...notificationResolvers.Query,
    ...platformFeeResolvers.Query,
    ...reviewResolvers.Query,
    ...followResolvers.Query,
    ...feedbackResolvers.Query,
    ...podIdeaResolvers.Query,
    ...goLiveResolvers.Query,
    ...callbackResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...podResolvers.Mutation,
    ...authResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...inviteResolvers.Mutation,
    ...policyResolvers.Mutation,
    ...placeResolvers.Mutation,
    ...supportResolvers.Mutation,
    ...settingsResolvers.Mutation,
    ...featureFlagResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...chatbotResolvers.Mutation,
    ...notificationResolvers.Mutation,
    ...platformFeeResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...followResolvers.Mutation,
    ...feedbackResolvers.Mutation,
    ...podIdeaResolvers.Mutation,
    ...goLiveResolvers.Mutation,
    ...callbackResolvers.Mutation,
    ...pushNotificationResolvers.Mutation,
  },
  Pod: podResolvers.Pod,
  Review: reviewResolvers.Review,
  Follow: followResolvers.Follow,
  Feedback: feedbackResolvers.Feedback,
  PodIdea: podIdeaResolvers.PodIdea,
  LiveSession: goLiveResolvers.LiveSession,
  ChatMessage: chatResolvers.ChatMessage,
  Place: placeResolvers.Place,
  SupportTicket: supportResolvers.SupportTicket,
  TicketReply: supportResolvers.TicketReply,
  CallbackRequest: callbackResolvers.CallbackRequest,
  User: userResolvers.User,
  Payment: paymentResolvers.Payment,
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

  // Trust the first proxy hop (nginx/load-balancer) so that express-rate-limit
  // can correctly read the real client IP from X-Forwarded-For.
  app.set('trust proxy', 1);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
        footer: false,
      }),
    ],
  });

  await connectDB();
  await server.start();

  /* ── Security headers ── */
  app.use(
    helmet({
      contentSecurityPolicy: IS_PRODUCTION ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  /* ── Gzip compression ── */
  app.use(compression());

  /* ── CORS configuration ── */
  app.use(
    cors({
      origin: IS_PRODUCTION
        ? [
            'https://podify-admin.exyconn.com',
            'https://podify-website.exyconn.com',
            'https://podify-api.exyconn.com',
            'https://podify-app.exyconn.com',
          ]
        : true,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '10mb' }));

  /* ── Rate limiting ── */
  app.use('/graphql', apiLimiter);
  app.use('/graphql/docs', apiLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'partywings-server', port: PORT });
  });

  /* ── Status endpoint – checks all services ── */
  app.get('/status', async (_req, res) => {
    const services: Array<{
      name: string;
      url: string;
      status: 'ok' | 'error';
      responseTime: number;
    }> = [];

    const urls: Array<{ name: string; url: string }> = IS_PRODUCTION
      ? [
          { name: 'api', url: 'https://podify-api.exyconn.com/health' },
          { name: 'admin', url: 'https://podify-admin.exyconn.com' },
          { name: 'website', url: 'https://podify-website.exyconn.com' },
          { name: 'app', url: 'https://podify-app.exyconn.com' },
        ]
      : [
          { name: 'api', url: `http://localhost:${PORT}/health` },
          { name: 'admin', url: 'http://localhost:4040' },
          { name: 'website', url: 'http://localhost:4041' },
          { name: 'app', url: 'http://localhost:4038' },
        ];

    await Promise.all(
      urls.map(async ({ name, url }) => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const resp = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          services.push({
            name,
            url,
            status: resp.ok ? 'ok' : 'error',
            responseTime: Date.now() - start,
          });
        } catch {
          services.push({ name, url, status: 'error', responseTime: Date.now() - start });
        }
      }),
    );

    const mongoStatus =
      (await import('mongoose')).default.connection.readyState === 1 ? 'connected' : 'disconnected';
    const allHealthy = services.every((s) => s.status === 'ok') && mongoStatus === 'connected';

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      mongodb: mongoStatus,
      services,
    });
  });

  /* ── GraphQL Documentation Explorer ── */
  app.get('/graphql/docs', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PartyWings API Documentation</title>
  <style>
    body { height: 100vh; margin: 0; overflow: hidden; }
    #sandbox { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="sandbox"></div>
  <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
  <script>
    new window.EmbeddedSandbox({
      target: '#sandbox',
      initialEndpoint: window.location.origin + '/graphql',
      includeCookies: false,
      initialState: {
        document: \`# Welcome to PartyWings API
# 
# Use this explorer to browse the full GraphQL schema,
# run queries, and test mutations.
#
# Example: Get current user
query Me {
  me {
    id
    name
    phone
    email
    role
  }
}
\`,
        pollForSchemaUpdates: true,
      },
    });
  </script>
</body>
</html>`);
  });

  /* ── File Upload REST endpoint ── */
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const fileName =
        (req.body as Record<string, string>).fileName ||
        file.originalname ||
        `upload-${Date.now()}`;
      const folder = (req.body as Record<string, string>).folder || '/uploads';

      const result = await uploadToImageKit(file.buffer, fileName, folder);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      logger.error('Upload error:', message);
      res.status(500).json({ error: message });
    }
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

  wss.on('connection', (ws) => {
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

  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`PartyWings Server ready at http://0.0.0.0:${PORT}/graphql`);
    logger.info(`WebSocket ready at ws://0.0.0.0:${PORT}/ws`);
    logger.info(`Environment: ${IS_PRODUCTION ? 'production' : 'development'}`);
  });

  /* ── Graceful shutdown ── */
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully…`);
    wss.close();
    httpServer.close(async () => {
      await server.stop();
      logger.info('Server stopped');
      process.exit(0);
    });
    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err: Error) => {
  logger.error('Server failed to start:', err);
  process.exit(1);
});
