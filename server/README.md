# PartyWings Server

GraphQL API server for PartyWings platform.

## Tech Stack

- Express + Apollo Server 4
- GraphQL with modular schema
- JWT authentication
- WebSocket for real-time chat
- ImageKit for media uploads
- Nodemailer for emails
- Winston for logging

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
| `JWT_SECRET` | Secret for JWT token signing |
| `OTP_DEFAULT` | Default OTP for development |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From email address |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINTS` | ImageKit URL endpoint |

## Scripts

```bash
pnpm dev          # Start dev server with watch mode
pnpm build        # Compile TypeScript
pnpm start        # Run compiled server
pnpm type-check   # Type check without emitting
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
```

## API

- **GraphQL**: `http://localhost:4039/graphql`
- **WebSocket**: `ws://localhost:4039/ws`
- **Health**: `GET http://localhost:4039/health`

## Module Structure

```
src/modules/
  auth/      # OTP login, admin login, JWT, ImageKit auth
  user/      # User CRUD, profile, roles
  pod/       # Pod CRUD, join/leave, pagination
  chat/      # Real-time messaging via WebSocket
  invite/    # Contact-based invitations
  policy/    # Platform policies management
```
