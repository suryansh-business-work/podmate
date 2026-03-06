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
- **OTP** — OTP verification with keyboard-safe input
- **CompleteProfile** — New user profile setup
- **Home** — Pod discovery with search and categories
- **Explore** — Map-based pod exploration
- **Chat** — Real-time messaging within joined pods
- **Profile** — User profile and settings
- **CreatePod** — Host a new pod with ImageKit image/video upload
- **RegisterPlace** — Venue registration with document upload
- **PodDetail** — Pod details with join/leave/checkout
- **Notifications** — In-app and push notifications
- **EditProfile** — Profile editing
- **MyPods** — User's hosted and joined pods
- **Payments** — Payment history
- **Checkout** — Pod payment checkout
- **Reviews** — Reviews and ratings
- **Feedback** — User feedback submission
- **PodIdeas** — Community pod ideas with upvoting
- **GoLive** — Live session management
- **FollowList** — Followers and following lists
- **UserProfile** — Other user profiles
- **PrivacySecurity** — Privacy and notification settings
- **Chatbot** — AI chatbot assistant
- **FAQ** — Frequently asked questions
- **Support** — Support ticket creation

## Features

- **Push Notifications** — Expo push notifications for Android, iOS, and web
- **Dark/Light Mode** — Automatic system theme detection with centralized color config
- **Keyboard-Safe Views** — Reusable KeyboardSafeView component; adjustResize on Android
- **Icon System** — @expo/vector-icons (MaterialIcons, MaterialCommunityIcons)
- **Real-time Chat** — WebSocket-based messaging

## Platforms

iOS and Android (web supported via Expo).
