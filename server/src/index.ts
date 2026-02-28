import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import type { GraphQLContext } from './modules/auth/auth.models';
import { getUserFromRequest } from './modules/auth/auth.services';
import userTypeDefs from './modules/user/user.typeDefs';
import podTypeDefs from './modules/pod/pod.typeDefs';
import authTypeDefs from './modules/auth/auth.typeDefs';
import userResolvers from './modules/user/user.resolvers';
import podResolvers from './modules/pod/pod.resolvers';
import authResolvers from './modules/auth/auth.resolvers';

const PORT = parseInt(process.env.PORT ?? '4039', 10);

const rootSchema = `#graphql
  type Query {
    me: User
    users(page: Int, limit: Int, search: String, sortBy: String, order: String): PaginatedUsers!
    pods(category: String, page: Int, limit: Int, search: String, sortBy: String, order: String): PaginatedPods!
    pod(id: ID!): Pod
    myPods: [Pod!]!
  }

  type Mutation {
    sendOtp(phone: String!): OtpResponse!
    verifyOtp(phone: String!, otp: String!): AuthPayload!
    createPod(input: CreatePodInput!): Pod!
    updatePod(id: ID!, input: UpdatePodInput!): Pod!
    deletePod(id: ID!): Boolean!
    joinPod(podId: ID!): Pod!
    leavePod(podId: ID!): Pod!
    updateProfile(name: String, avatar: String): User!
    updateUserRole(userId: ID!, role: UserRole!): User!
    getImageKitAuth: ImageKitAuth!
  }
`;

const typeDefs = [rootSchema, userTypeDefs, podTypeDefs, authTypeDefs];

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...podResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...podResolvers.Mutation,
    ...authResolvers.Mutation,
  },
  Pod: podResolvers.Pod,
};

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

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`PartyWings Server ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch((err: Error) => {
  // eslint-disable-next-line no-console
  console.error('Server failed to start:', err);
  process.exit(1);
});
