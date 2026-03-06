# PartyWings Server

GraphQL API server for PartyWings platform.

## Tech Stack

- Express + Apollo Server 4
- GraphQL with modular schema
- MongoDB Atlas (Mongoose 9)
- JWT authentication
- WebSocket for real-time chat
- ImageKit for media uploads
- Nodemailer for emails
- Winston for logging
- Expo Push Notifications

## Setup

```bash
# Install dependencies
pnpm install

# Copy env file and fill credentials
cp .env.example .env

# Start development server
pnpm dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 4039) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From email address |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINTS` | ImageKit URL endpoint |
| `OPENAI_API_KEY` | OpenAI API key for chatbot |
| `DEV_EMAIL` | Admin credentials delivery email |

## Scripts

```bash
pnpm dev          # Start dev server with watch mode
pnpm build        # Compile TypeScript
pnpm start        # Run compiled server
pnpm type-check   # Type check without emitting
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
```

## API Endpoints

- **GraphQL**: `http://localhost:4039/graphql`
- **WebSocket**: `ws://localhost:4039/ws`
- **Health**: `GET /health`
- **Status**: `GET /status` (full service health dashboard)
- **Upload**: `POST /upload` (ImageKit proxy)

## Module Structure

```
src/modules/
  auth/              # OTP login, admin login, JWT, ImageKit auth
  user/              # User CRUD, profile, roles, toggle active
  pod/               # Pod CRUD, join/leave, checkout, pagination
  chat/              # Real-time messaging via WebSocket
  invite/            # Contact-based invitations
  policy/            # Platform policies (Venue, User, Host, ToS, Privacy)
  place/             # Venue registration, approval workflow
  support/           # Support tickets with threaded replies
  settings/          # App settings and configuration
  featureFlag/       # Feature flag management
  payment/           # Payment processing and refunds
  chatbot/           # AI-powered chatbot (OpenAI)
  notification/      # In-app notifications and broadcasts
  pushNotification/  # Push notification tokens and delivery (Expo)
  platformFee/       # Platform fee configuration
  review/            # Reviews and ratings
  follow/            # User follow system
  feedback/          # User feedback submissions
  podIdea/           # Community pod ideas with upvoting
  goLive/            # Live session management
  callback/          # Callback request management
```

Each module follows the structure:
```
<module>/
  <module>.typeDefs.ts    # GraphQL schema definitions
  <module>.resolvers.ts   # GraphQL resolvers
  <module>.services.ts    # Business logic
  <module>.models.ts      # Mongoose models and interfaces
  <module>.validators.ts  # Input validation (where needed)
```
