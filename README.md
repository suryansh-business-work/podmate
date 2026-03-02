# PartyWings

Trust-based communities platform — discover, host, and join curated micro-events (Pods).

## Monorepo Structure

| Package | Description | Port |
|---------|-------------|------|
| `server` | GraphQL API with Express + Apollo Server | 4039 |
| `admin-panel` | React + MUI admin dashboard | 4040 |
| `app` | React Native (Expo) mobile app | 4038 |
| `website` | Astro landing page | 4041 |

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (mandatory — no npm or yarn)

## Quick Start

```bash
# Install all dependencies
pnpm install

# Start the server
pnpm dev:server

# Start admin panel
pnpm dev:admin

# Start mobile app
pnpm dev:app

# Start all services (server + admin + website)
pnpm dev:all
```

## Environment Variables

Copy `.env.example` to `.env` in each package and fill in your credentials:

```bash
cp server/.env.example server/.env
cp admin-panel/.env.example admin-panel/.env
cp app/.env.example app/.env
```

## Build Commands

```bash
# Build all packages
pnpm build

# Type-check all packages
pnpm type-check

# Build Android APK
pnpm build:apk

# Build iOS
pnpm build:ios
```

## Tech Stack

- **Server**: Express, Apollo Server 4, GraphQL, JWT, WebSocket, ImageKit, Nodemailer, Winston
- **Admin Panel**: React 19, MUI 6, Vite, Apollo Client, Formik, Yup
- **Mobile App**: React Native 0.81, Expo 54, React Navigation 7, Apollo Client, react-native-paper
- **Website**: Astro

## Project Standards

- TypeScript strict mode enabled across all packages
- No `any` types — all interfaces and types must be properly defined
- pnpm only — no npm or yarn
- Components under 200 lines
- Formik + Yup for all forms
- Server data only — no dummy/mock data on client
