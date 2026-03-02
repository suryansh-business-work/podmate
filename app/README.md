# PartyWings Mobile App

React Native mobile app for discovering, hosting, and joining Pods.

## Tech Stack

- React Native 0.81 + Expo 54
- TypeScript (strict mode)
- React Navigation 7
- Apollo Client 3
- react-native-paper 5
- Formik + Yup for forms
- expo-image-picker + ImageKit for media uploads
- @react-native-community/datetimepicker

## Setup

```bash
# Install dependencies
pnpm install

# Copy env file
cp .env.example .env

# Start Expo dev server
pnpm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | GraphQL API URL |
| `EXPO_PUBLIC_WS_URL` | WebSocket URL for real-time chat |
| `EXPO_PUBLIC_IMAGEKIT_URL` | ImageKit URL endpoint |
| `EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit public key |

## Scripts

```bash
pnpm start          # Start Expo dev server (port 4038)
pnpm android        # Start on Android
pnpm ios            # Start on iOS
pnpm type-check     # Type check
pnpm lint           # Run ESLint
pnpm format         # Format with Prettier
```

## Build (APK / IPA)

Requires [EAS CLI](https://docs.expo.dev/build/introduction/):

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Build Android APK (preview)
pnpm build:apk

# Build iOS (preview)
pnpm build:ios

# Production builds
pnpm build:prod:android
pnpm build:prod:ios
```

## Screens

- **Splash** — Animated brand splash
- **Login** — Phone number OTP authentication
- **OTP** — OTP verification
- **CompleteProfile** — New user profile setup
- **Home** — Pod discovery with search and categories
- **Explore** — Map-based pod exploration
- **Chat** — Real-time messaging within joined pods
- **Profile** — User profile and settings
- **CreatePod** — Host a new pod with ImageKit image/video upload
- **RegisterPlace** — Venue registration with document upload
- **PodDetail** — Pod details with join/leave
- **Notifications** — User's pod notifications

## Platforms

iOS and Android only (web platform removed).
