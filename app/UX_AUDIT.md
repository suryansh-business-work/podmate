# PartyWings Mobile App — UX, UI & Performance Audit

> **Date:** March 6, 2026
> **Stack:** React Native 0.81 · Expo 54 · React Navigation 7 · React Native Paper 5 · Apollo Client 3 · TypeScript 5.9

---

## Executive Summary

The PartyWings mobile app has a solid functional foundation with good screen coverage and a working theme system. However, a deep audit reveals **critical gaps** across accessibility (nearly zero coverage), performance (zero `React.memo`, untuned lists), interaction design (no haptics, no gestures, minimal animations), and code architecture (8 files exceeding the 200-line standard, monolithic GraphQL files). This document provides a section-by-section audit with prioritized, actionable improvements.

### Key Metrics at a Glance

| Metric | Current | Target |
|--------|---------|--------|
| Accessibility props | 12 instances (1 screen only) | Every interactive element |
| `React.memo` usage | **0** components | All list items + leaf components |
| Files > 200 lines | **8 screen files** | 0 |
| `hitSlop` usage | 2 instances | Every small touch target |
| Haptic feedback | **0** | All primary actions |
| `getItemLayout` on FlatLists | **0** | All fixed-height lists |
| Custom animations | 4 components | All screen transitions + interactions |
| Gesture handler usage | **0** | Chat swipe, image zoom, drawer swipe |
| `GET_ME` independent fetches | 6 screens | 1 (context-level) |

---

## 1. UX Architecture

### Current Screen Hierarchy

```
App
├── SplashScreen
├── Auth Flow
│   ├── LoginScreen
│   └── OtpScreen
├── CompleteProfileScreen
└── Main (Authenticated)
    ├── MainTabs
    │   ├── Home (feed + search)
    │   ├── Explore (TikTok-style swipe)
    │   ├── Create (opens modal)
    │   ├── Chat (pod selector → room)
    │   └── Profile (settings hub)
    ├── Stack Screens (18 screens)
    │   ├── PodDetail → Checkout → Success
    │   ├── CreatePod (modal)
    │   ├── Notifications
    │   ├── RegisterPlace (modal)
    │   ├── EditProfile, Payments, MyPods, Privacy
    │   ├── Faq, Support, Feedback, PodIdeas
    │   ├── GoLive, Reviews
    │   ├── FollowList, UserProfile
    │   └── Chatbot (modal)
    └── Custom Drawer (animated overlay)
```

### Issues & Improvements

| Issue | Priority | Recommendation |
|-------|----------|----------------|
| **18 stack screens** all register at root level — flat hierarchy | High | Group related screens into nested navigators: `AccountStack` (EditProfile, Payments, Privacy, MyPods), `SupportStack` (Faq, Support, Feedback), `SocialStack` (FollowList, UserProfile) |
| Drawer duplicates tab navigation (Home, Explore, Chat all appear in drawer AND tabs) | Medium | Remove tab-equivalent items from drawer; keep only items not in tabs (RegisterPlace, Payments, Help, Support, etc.) |
| **No deep linking** configured — push notifications can only navigate to PodDetail and Notifications | High | Add Expo Linking config for all screens: `partywings://pod/:id`, `partywings://chat/:podId`, etc. |
| Profile screen acts as both a profile viewer and a settings hub | Medium | Split into `ProfileScreen` (user card, posts, followers) and `SettingsScreen` (theme, privacy, help, logout) |
| Auth flow is linear (Login → OTP → CompleteProfile) with no skip/back on CompleteProfile | Low | Allow users to skip CompleteProfile and fill in later |
| 3 duplicate screen entry files (e.g., `LoginScreen.tsx` at root AND `Auth/Login/LoginScreen.tsx`) | Medium | Remove root-level wrappers; import directly from module folders |

### Recommended Navigation Refactor

```
RootStack
├── AuthStack (Login, Otp)
├── OnboardingStack (CompleteProfile, ...)
└── AppStack
    ├── MainTabs (Home, Explore, Create, Chat, Profile)
    ├── AccountStack (EditProfile, Payments, MyPods, Privacy)
    ├── SupportStack (Faq, Support, Feedback, PodIdeas)
    ├── SocialStack (FollowList, UserProfile)
    └── Modal Group (CreatePod, Chatbot, RegisterPlace)
        ├── PodDetail → Checkout
        ├── GoLive
        ├── Reviews
        └── Notifications
```

---

## 2. Mobile Interaction Design

### Touch Targets — **FAILING**

Apple HIG requires **44pt minimum**; Android Material recommends **48dp**.

| Component | Element | Size | Status | Fix |
|-----------|---------|------|--------|-----|
| HomeScreen | Search clear icon | ~18pt | **FAIL** | Add `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` |
| HomeScreen | Menu hamburger | ~24pt | **FAIL** | Add padding or `hitSlop` |
| CheckoutScreen | Back arrow | ~24pt | **FAIL** | Wrap in `View` with `minWidth: 44, minHeight: 44` |
| NetworkBanner | Retry button | ~24pt (padding: 4) | **FAIL** | Increase `paddingVertical: 12, paddingHorizontal: 16` |
| CreatePodScreen | Close button | ~24pt | **FAIL** | Add `hitSlop` |
| All header back buttons | Back arrow icons | Varies | **Most FAIL** | Create standard `BackButton` component with 44pt minimum |

**Recommendation:** Create a reusable `IconButton` component with enforced minimum touch target:

```tsx
interface IconButtonProps {
  icon: MaterialIconName;
  size?: number;
  color?: string;
  onPress: () => void;
  accessibilityLabel: string;
}

const IconButton: React.FC<IconButtonProps> = React.memo(({
  icon, size = 24, color, onPress, accessibilityLabel,
}) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
  >
    <MaterialIcons name={icon} size={size} color={color} />
  </TouchableOpacity>
));
```

### Thumb-Zone Ergonomics

| Pattern | Current | Recommendation |
|---------|---------|----------------|
| Primary actions (Join Pod, Pay) | Bottom of screen ✅ | Good — in natural thumb zone |
| Navigation (back buttons) | Top-left corner | ❌ Hard to reach one-handed. Consider adding swipe-back gesture |
| FABs (Chatbot, Create Review) | Bottom-right ✅ | Good placement |
| Search bar | Top of screen | ❌ Consider pull-down-to-search or floating search |
| Filters/categories | Top of screen | ❌ Move to bottom sheet for thumb accessibility |

### Gesture Support — **ABSENT**

| Expected Gesture | Status | Library Needed |
|------------------|--------|----------------|
| Swipe-back navigation | ❌ Missing | Built-in iOS, needs `react-native-gesture-handler` for Android |
| Swipe-to-delete on chat/notifications | ❌ Missing | `react-native-gesture-handler` `Swipeable` |
| Pinch-to-zoom on images | ❌ Missing | `react-native-gesture-handler` + `react-native-reanimated` |
| Long-press on cards (quick actions) | ❌ Missing | Native `onLongPress` prop |
| Double-tap to bookmark | ❌ Missing | `TapGestureHandler` |
| Pull-to-refresh | ✅ Present | Already implemented via RefreshControl |
| Swipe between media gallery | ✅ Present | FlatList paging |

---

## 3. Micro-interactions

### Current Animation Inventory

| Component | Animation | Quality |
|-----------|-----------|---------|
| SplashScreen | Fade-in logo | ✅ Good, native driver |
| Skeleton | Pulse shimmer | ✅ Good, native driver |
| NetworkBanner | Slide in/out | ✅ Good, spring + timing |
| ChatbotFab | Press scale | ✅ Good, spring |
| **Everything else** | **None** | ❌ |

### Missing Micro-interactions — Priority Matrix

| Interaction | Priority | Implementation |
|-------------|----------|----------------|
| **Button press feedback** | **High** | Animated scale (0.95) on `onPressIn` + haptic `impactLight` |
| **Screen transitions** | **High** | `react-native-reanimated` shared element transitions between EventCard → PodDetail |
| **List item entrance** | **High** | Staggered `FadeInUp` for FlatList items using `react-native-reanimated` `entering` prop |
| **Tab switch** | Medium | Custom tab bar with animated indicator underline |
| **Pull-to-refresh** | Medium | Custom animated refresh indicator (Lottie or Reanimated) |
| **Card bookmark toggle** | Medium | Heart/bookmark scale + color animation |
| **Error state shake** | Medium | Shake animation on form validation error |
| **Success celebration** | Medium | Confetti or checkmark animation on checkout success (Lottie) |
| **Drawer open/close** | Low | Already animated with Animated API ✅ |
| **Theme toggle** | Low | Smooth color transition when switching dark/light |

### Recommended Implementation — Button Press Feedback

```tsx
// hooks/useAnimatedPress.ts
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useAnimatedPress(scale = 0.96) {
  const animValue = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(animValue, {
      toValue: scale,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [animValue, scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [animValue]);

  return { animValue, onPressIn, onPressOut };
}
```

### Recommended Libraries

| Library | Purpose | Priority |
|---------|---------|----------|
| `expo-haptics` | Tactile feedback for presses, success, errors | **High** |
| `react-native-reanimated` (v3) | Layout animations, shared elements, gesture-driven UI | **High** |
| `react-native-gesture-handler` | Swipe-to-delete, pinch-zoom, pan gestures | **High** |
| `lottie-react-native` | Success/error/loading Lottie animations | Medium |
| `react-native-skia` | Advanced shimmer/gradient animations | Low |

---

## 4. Performance UX

### Re-render Analysis

#### `React.memo` — **Zero Usage Across Entire Codebase**

This is the single biggest performance gap. Every parent re-render cascades to all children unconditionally.

**Critical components needing `React.memo`:**

| Component | Why | Impact |
|-----------|-----|--------|
| `EventCard` | Rendered in FlatList (Home feed) | **Very High** — each scroll triggers re-renders of all visible cards |
| `PodCard` | Rendered in FlatList (Explore) | **Very High** |
| `SafeImage` | Used ~40+ times across screens | **High** |
| `GradientButton` | Used in forms that re-render on every keystroke | **High** |
| `ChatbotFab` | Static FAB, re-renders on every parent state change | Medium |
| `Skeleton*` variants | Decorative, should never re-render | Medium |
| `CategoryChip` | Rendered in horizontal list | Medium |
| `OtpInput` | Individual digit re-renders on sibling changes | Medium |
| `DrawerMenu` | Complex component re-renders when any parent state changes | Medium |
| `NetworkBanner` | Always-mounted singleton | Low |

**Estimated render reduction: 60-70% fewer renders in list screens.**

#### FlatList Optimization — **Severely Under-optimized**

| Screen | `getItemLayout` | `windowSize` | `maxToRenderPerBatch` | `initialNumToRender` | `removeClippedSubviews` |
|--------|:-:|:-:|:-:|:-:|:-:|
| HomeScreen | ❌ | ❌ Default(21) | ❌ Default(10) | ❌ Default(10) | ❌ |
| ExploreScreen | ❌ | ❌ | ❌ | ❌ | ❌ |
| ChatScreen (list) | ❌ | ❌ | ❌ | ❌ | ❌ |
| ChatRoom (messages) | ❌ | ✅ 11 | ✅ 15 | ✅ 30 | ✅ Android |
| Notifications | ❌ | ❌ | ❌ | ❌ | ❌ |

**Only ChatRoom has any FlatList optimization props** — good implementation there, but missing everywhere else.

Recommended config for HomeScreen feed:

```tsx
<FlatList
  data={pods}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={(_, index) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index,
  })}
  windowSize={5}
  maxToRenderPerBatch={5}
  initialNumToRender={4}
  removeClippedSubviews={Platform.OS === 'android'}
  updateCellsBatchingPeriod={50}
/>
```

#### GraphQL Over-fetching

**`GET_ME` is fetched independently by 6 screens** + ThemeContext + DrawerMenu:
- `HomeScreen` — for `savedPodIds`
- `ExploreScreen` — for `savedPodIds`, `currentUserId`
- `PodDetailScreen` — for `currentUserId`
- `ProfileScreen` — for user display
- `EditProfileScreen` — for form prefill
- `DrawerMenu` — for user display

With Apollo's `cache-first` policy this is mostly a cache hit, but it still causes:
- 6 separate watcher subscriptions
- Unnecessary re-renders when any `me` field changes
- Wasted component mount work

**Recommendation:** Create a `UserContext` that wraps `GET_ME` once at the app level:

```tsx
// contexts/UserContext.tsx
const UserContext = createContext<UserContextValue>(defaultValue);

export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { data, loading, error, refetch } = useQuery(GET_ME, {
    fetchPolicy: 'cache-and-network',
  });

  const value = useMemo(() => ({
    user: data?.me ?? null,
    loading,
    error,
    refetch,
    isAuthenticated: !!data?.me,
    savedPodIds: data?.me?.savedPodIds ?? [],
  }), [data, loading, error, refetch]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
```

#### Monolithic GraphQL Files

| File | Lines | Issue |
|------|-------|-------|
| `queries.ts` | **496** | All queries in one file |
| `mutations.ts` | **445** | All mutations in one file |

**Recommendation:** Split by domain:

```
graphql/
  client.ts
  queries/
    pods.queries.ts
    user.queries.ts
    chat.queries.ts
    support.queries.ts
    ...
  mutations/
    pods.mutations.ts
    user.mutations.ts
    chat.mutations.ts
    ...
  fragments/
    pod.fragment.ts
    user.fragment.ts
```

Also extract shared **fragments** to avoid field duplication between `GET_PODS` and `GET_POD`.

#### Other Performance Issues

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Inline `renderItem` arrow in FlatList | ExploreScreen L~109 | Defeats virtualization keyExtractor optimization | Wrap in `useCallback` |
| Inline `ItemSeparatorComponent` | ChatScreen L~87 | New component ref each render | Extract to module-level const |
| `useVideoPlayer` called unconditionally | PodDetailScreen L~92 | Initializes video player for text-only pods | Conditional: `useVideoPlayer(firstVideoUrl ? { uri: firstVideoUrl } : null, ...)` |
| `Dimensions.get('window')` at module level | SplashScreen, Explore.styles | Won't respond to orientation/window changes | Use `useWindowDimensions()` hook |
| Font config duplicated | `theme.ts` AND `ThemeContext.tsx` | Wasted memory, maintenance burden | Extract to shared `fonts.ts` |
| Skeleton creates independent `Animated.Value` per instance | Skeleton.tsx | Many concurrent animation loops on loading screens | Share a single animated value across all skeleton instances |
| `ListHeaderComponent` as inline variable | HomeScreen | Re-created every render | Extract to `React.memo` component or use `useMemo` |

---

## 5. Loading, Empty, and Error States

### Current Coverage

| Screen | Loading | Error | Empty | Offline |
|--------|:-------:|:-----:|:-----:|:-------:|
| HomeScreen | ✅ SkeletonFeed | ✅ Icon + message | ✅ Icon + message | ⚠️ NetworkBanner only |
| ExploreScreen | ✅ Spinner | ✅ Basic text | ✅ Icon + message | ⚠️ |
| ChatScreen | ✅ Spinner | ✅ Basic text | ✅ Icon + message | ⚠️ |
| ProfileScreen | ✅ SkeletonProfile | ✅ Basic text | ❌ Missing | ⚠️ |
| PodDetailScreen | ✅ SkeletonDetail | ✅ Icon + back button | N/A | ⚠️ |
| CheckoutScreen | ✅ Spinner | ❌ Alert only | N/A | ⚠️ |
| CreatePodScreen | ✅ via loading prop | ❌ Alert only | N/A | ⚠️ |
| NotificationsScreen | ✅ Spinner | ✅ Basic | ✅ Icon + message | ⚠️ |
| MyPodsScreen | ✅ Spinner | ✅ Basic | ✅ Icon + message | ⚠️ |
| GoLive, PodIdeas, Reviews, Feedback | ✅ Spinner | ✅ Basic | ✅ Icon + message | ⚠️ |

### Issues

1. **No dedicated offline mode** — Only `NetworkBanner` indicates connectivity. Screens still attempt queries and show generic errors.
2. **Error states are inconsistent** — Some use icon + message inline, others use `Alert.alert()` only (Checkout, CreatePod).
3. **No error retry mechanism** except NetworkBanner retry button. Data-level errors have no "Try Again" button.
4. **No skeleton loaders** for most screens — only Home, Profile, and PodDetail have them.
5. **Empty states lack CTAs** — Empty list messages are informational only, no action button to guide users.

### Recommended Reusable State Components

```tsx
// components/StateView/EmptyState.tsx
interface EmptyStateProps {
  icon: MaterialIconName;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

// components/StateView/ErrorState.tsx
interface ErrorStateProps {
  error: Error | string;
  onRetry: () => void;
  compact?: boolean; // inline variant vs full-screen
}

// components/StateView/OfflineState.tsx
interface OfflineStateProps {
  cachedAt?: Date;
  onRetry: () => void;
}

// components/StateView/LoadingState.tsx
// Wrapper that shows skeleton or spinner based on context
interface LoadingStateProps {
  variant: 'skeleton' | 'spinner' | 'shimmer';
  lines?: number;
}
```

### Offline Strategy

```
1. Show cached data with "Last updated: 2 min ago" subtitle
2. NetworkBanner slides in at top
3. Mutations queue locally and sync when reconnected
4. Disable destructive actions (checkout, create pod) when offline
5. Show inline "Offline — showing cached data" badge on lists
```

---

## 6. Visual Design System

### Current System Assessment

#### Spacing Scale ✅ Good — Already defined

```typescript
spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 }
```

**Issue:** Missing values between `xxxl (32)` and large layout gaps. Many screens use magic numbers like `40`, `60`, `100`.

**Recommendation:** Add `xxxxl: 48` and `layout: 64` to cover common padding needs.

#### Typography Scale ✅ Good — MD3 font config

Already has displayLarge through labelSmall. Well-structured.

**Issue:** Font config is **duplicated** in both `theme.ts` (L8-L95) and `ThemeContext.tsx` (L11-L90). This is 170 lines of identical code.

**Fix:** Extract to `src/fonts.ts` and import in both places.

#### Color Roles ✅ Improved — After recent dark mode fix

The `AppColorPalette` now has 40+ named color roles. Good coverage.

**Issues remaining:**
- `cardShadow` in dark mode is `rgba(0,0,0,0.3)` — shadow on dark background has no visual effect. Consider using `rgba(0,0,0,0.6)` or an elevation-based surface tint instead.
- Several palette colors are identical between light and dark (`primary`, `secondary`, `accent`, `success`, `warning`, `error`, `white`, `black`). These should ideally be slightly adjusted for dark mode (e.g., `success` could be `#34D399` in dark for better visibility).

#### Elevation System — **Missing**

No elevation scale defined. Shadows are defined ad-hoc per component with varying `shadowOpacity`, `shadowRadius`, and `elevation` values.

**Recommendation:**

```typescript
// theme.ts
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 16,
  },
};
```

#### Component Variants — **Inconsistent**

| Component | Variants Supported | Issue |
|-----------|-------------------|-------|
| GradientButton | Primary gradient only | No secondary, outline, ghost, text variants |
| Skeleton | 3 layout variants (Feed, Profile, Detail) | Good |
| Card (EventCard) | Single variant | No compact, horizontal, or featured variants |
| Input fields | Inline Formik style only | No reusable TextInput component with label, error, helper |
| Badge | Ad-hoc per screen | No shared Badge component |
| Chip (CategoryChip) | Single variant | No outlined, filled, toggle variants |

**Recommendation:** Build a `Button` component with variants:

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: MaterialIconName;
  onPress: () => void;
}
```

---

## 7. Accessibility — **CRITICAL FAILURE**

### Current State

- **12 accessibility props total** across entire codebase
- Only `LoginScreen` has an `accessibilityLabel` on the phone input
- Only test files reference `accessibilityState`
- Zero `accessibilityRole` declarations
- Zero `accessibilityHint` declarations
- Zero `accessibilityLiveRegion` declarations
- Zero screen reader testing evidence

### Required Fixes by Priority

#### P0 — Legal/Compliance Risk

| Component | Required Props |
|-----------|---------------|
| All `TouchableOpacity` buttons | `accessibilityRole="button"` + `accessibilityLabel` |
| All `TextInput` fields | `accessibilityLabel` describing the field purpose |
| NetworkBanner | `accessibilityRole="alert"` + `accessibilityLiveRegion="assertive"` |
| OtpInput digits | `accessibilityLabel={\`OTP digit ${i+1} of ${length}\`}` |
| Image components | `accessibilityRole="image"` + descriptive label |
| Navigation tabs | `accessibilityRole="tab"` (handled by React Navigation) |

#### P1 — Core Experience

| Pattern | Implementation |
|---------|----------------|
| Screen headers | `accessibilityRole="header"` on all `<Text style={styles.header}>` |
| Loading states | `accessibilityLabel="Loading"` + `accessibilityRole="progressbar"` |
| Status badges | `accessibilityLabel={\`Status: ${status}\`}` |
| Form errors | `accessibilityRole="alert"` + `accessibilityLiveRegion="polite"` |
| Decorative icons | `accessible={false}` or `importantForAccessibility="no"` |

#### P2 — Color Contrast

| Element | Current | WCAG AA (4.5:1) | Status |
|---------|---------|-----------------|--------|
| `textTertiary` (#9CA3AF) on `surface` (#FFF5F8) | 2.86:1 | 4.5:1 required | **FAIL** |
| `textSecondary` (#6B7280) on `surface` (#FFF5F8) | 4.48:1 | 4.5:1 required | **BORDERLINE** |
| `border` (#FECDD3) on `surface` (#FFF5F8) | 1.24:1 | 3:1 for non-text | **FAIL** |
| `text` (#111827) on `surface` (#FFF5F8) | 15.2:1 | 4.5:1 required | ✅ PASS |
| `primary` (#F50247) on `white` (#FFFFFF) | 5.64:1 | 4.5:1 required | ✅ PASS |

**Fix:** Darken `textTertiary` to `#6B7280` and `textSecondary` to `#4B5563` for light mode.

#### P3 — Dynamic Text Sizing

No `maxFontSizeMultiplier` or `allowFontScaling` configuration found. The app should:

1. Allow text scaling up to 200% (iOS Dynamic Type / Android Font Scale)
2. Set `maxFontSizeMultiplier={1.5}` on navigation headers to prevent layout overflow
3. Test layouts at 200% font scale — buttons and cards may overflow

---

## 8. Code Structure Improvements

### Files Exceeding 200-line Standard

| File | Lines | Action |
|------|-------|--------|
| `PodDetailScreen.tsx` | **549** | Split into: HeroGallery, InfoGrid, AttendeesRow, ReviewsSummary, BottomBar |
| `FaqScreen.tsx` | **512** | Extract: FaqCategoryTabs, FaqAccordion, FaqSearchBar, FaqContactSection |
| `VenueLocationPicker.tsx` | **489** | Extract: SearchBar, PredictionsList, MapPreview, ConfirmButton |
| `PodFormBody.tsx` | **402** | Extract: MediaSection, DateTimeSection, LocationSection, PricingSection |
| `ChatRoom.tsx` | **336** | Extract: MessageBubble, InputBar, AttachmentPanel, DaySeparator |
| `PodCard.tsx` | **330** | Extract: MediaSlider, BottomOverlay, ActionButtons, SeatsBar |
| `ReviewsScreen.tsx` | **298** | Extract: RatingStats, ReviewCard, WriteReviewModal |
| `PodIdeasScreen.tsx` | **293** | Extract: IdeaCard, VoteButton, SubmitIdeaModal |

### Current Folder Structure — Assessment

```
src/
  colors.ts          ✅ Centralized
  theme.ts           ⚠️ Duplicates font config with ThemeContext
  config.ts          ✅
  components/        ⚠️ Mix of file-level and folder-level components
  contexts/          ✅ Single context, clean
  graphql/           ❌ Monolithic files (495 + 445 lines)
  hooks/             ✅ Clean, 5 hooks
  navigation/        ✅ Good structure
  screens/           ⚠️ Duplicate entry files at root (LoginScreen.tsx, etc.)
  utils/             ✅ Single utility
```

### Recommended Structure

```
src/
  assets/                  # Local assets
  components/
    ui/                    # Primitives (Button, IconButton, Badge, Chip, Avatar)
    feedback/              # StateView, Skeleton, Toast, EmptyState, ErrorState
    layout/                # KeyboardSafeView, ScreenWrapper, Section
    media/                 # SafeImage, MediaUploader, VideoPlayer
    navigation/            # DrawerMenu, TabBar, BackButton
  contexts/
    ThemeContext.tsx
    UserContext.tsx         # NEW: centralized GET_ME
    AuthContext.tsx         # Extract from useAuth hook
  graphql/
    client.ts
    fragments/             # Shared field sets
    queries/               # Per-domain query files
    mutations/             # Per-domain mutation files
  hooks/
    animations/            # useAnimatedPress, useFadeIn, useShake
    data/                  # useDebounce, usePagination
    platform/              # usePushNotifications, useLocation, useImageKit
  navigation/
    RootNavigator.tsx
    MainTabs.tsx
    stacks/                # AccountStack, SupportStack, SocialStack
  screens/
    [Screen]/
      [Screen]Screen.tsx
      [Screen].styles.ts
      [Screen].types.ts
      components/          # Screen-specific sub-components
      hooks/               # Screen-specific hooks
      __tests__/
  theme/
    colors.ts
    fonts.ts               # Extracted shared font config
    spacing.ts
    elevation.ts           # NEW: elevation scale
    index.ts               # Barrel export
  utils/
    format.ts              # Date, currency formatters
    location.ts
    validation.ts          # Shared Yup schemas
```

### Component Architecture Pattern

Every component should follow:

```
ComponentName/
  ComponentName.tsx        # Implementation
  ComponentName.styles.ts  # Themed styles (createStyles factory)
  ComponentName.types.ts   # Props interface, related types
  index.ts                 # Barrel export
  __tests__/
    ComponentName.test.tsx
```

---

## 9. UX Metrics

### Metrics to Track

| Metric | Measurement Method | Current Estimate | Target |
|--------|-------------------|------------------|--------|
| **Time to Interactive (TTI)** | From app launch to first usable screen | ~2-3s (splash + auth check + data load) | < 1.5s |
| **First Contentful Paint** | Splash → first real content visible | ~1.5s | < 1s |
| **Navigation Latency** | Time between tab press and screen render | ~100-200ms (no animations) | < 16ms (with pre-loaded content) |
| **Tap Response Time** | Time from touch to visual feedback | ~0ms (no feedback animation) | < 100ms with haptic + visual |
| **Perceived Loading Time** | Skeleton → real content swap | Varies (network dependent) | < 1s with cache-first |
| **List Scroll FPS** | Frames per second during scroll | ~45-55 FPS (no React.memo) | Stable 60 FPS |
| **Input Latency** | Keystroke to character visible | ~16ms (good) | < 16ms |
| **Memory Usage** | JS heap during long sessions | Unknown | Monitor for leaks |
| **Bundle Size** | Total JS bundle | Unknown | Monitor with `expo-updates` |

### How to Measure

```bash
# 1. React Native Performance Monitor (dev menu)
# Shake device → Show Perf Monitor → Monitor JS/UI FPS

# 2. Flipper (recommended)
pnpm add -D react-native-flipper
# Monitor: Network, Layout, React DevTools, Performance

# 3. Custom Performance Logging
import { PerformanceObserver } from 'react-native-performance';

# 4. expo-updates bundle analysis
npx expo export --platform android --dump-sourcemap
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2) — **High Priority**

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1.1 | Install `react-native-reanimated`, `react-native-gesture-handler`, `expo-haptics` | 1h | Enables all subsequent animation/gesture work |
| 1.2 | Create `IconButton` component with enforced 44pt touch targets + a11y | 2h | Fixes all touch target violations |
| 1.3 | Add `React.memo` to `EventCard`, `PodCard`, `SafeImage`, `GradientButton`, `CategoryChip`, `Skeleton*` | 3h | ~60% fewer re-renders |
| 1.4 | Add `getItemLayout`, `windowSize`, `maxToRenderPerBatch` to all FlatLists | 2h | Smoother scrolling |
| 1.5 | Extract font config to shared `fonts.ts`, remove duplication | 1h | Maintenance |
| 1.6 | Create `UserContext` to centralize `GET_ME` | 2h | Eliminates 5 redundant query subscriptions |
| 1.7 | Add `accessibilityLabel` + `accessibilityRole` to all interactive elements | 4h | Critical for accessibility compliance |

### Phase 2: Interactions (Week 3-4) — **High Priority**

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 2.1 | Create `useAnimatedPress` hook + integrate into GradientButton, EventCard | 3h | Premium button feel |
| 2.2 | Add haptic feedback (`expo-haptics`) to primary actions | 2h | Tactile confirmation |
| 2.3 | Add `entering`/`exiting` animations to FlatList items (Reanimated) | 3h | Polished list experience |
| 2.4 | Build shared `ErrorState`, `EmptyState`, `LoadingState` components | 4h | Consistent state handling |
| 2.5 | Replace `Alert.alert` errors with inline error UI in Checkout, CreatePod | 2h | Better error UX |
| 2.6 | Add Lottie success animation to Checkout success state | 2h | Celebratory feedback |

### Phase 3: Architecture (Week 5-6) — **Medium Priority**

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 3.1 | Decompose `PodDetailScreen` into 5 sub-components | 4h | Under 200-line compliance |
| 3.2 | Decompose `FaqScreen`, `VenueLocationPicker`, `PodFormBody`, `ChatRoom` | 8h | Under 200-line compliance |
| 3.3 | Split `queries.ts` and `mutations.ts` into domain modules + shared fragments | 4h | Maintainability |
| 3.4 | Create nested navigators (AccountStack, SupportStack) | 3h | Cleaner navigation tree |
| 3.5 | Create reusable form components (TextInputField, SelectField, DateField) | 6h | DRY form patterns |
| 3.6 | Add elevation system to theme | 2h | Consistent shadows |

### Phase 4: Polish (Week 7-8) — **Medium Priority**

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 4.1 | Add swipe-to-dismiss on chat/notification items | 4h | Modern interaction pattern |
| 4.2 | Add pinch-to-zoom on image galleries | 4h | Expected mobile gesture |
| 4.3 | Implement Expo deep linking for all screens | 4h | Push notification → screen |
| 4.4 | Build custom animated tab bar with indicator | 4h | Premium tab experience |
| 4.5 | Improve color contrast (WCAG AA compliance) | 2h | Accessibility |
| 4.6 | Add shared element transitions (EventCard → PodDetail) | 6h | Premium navigation feel |

### Phase 5: Advanced (Week 9-10) — **Low Priority**

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 5.1 | Implement offline mode with cached data + queue mutations | 8h | Resilient UX |
| 5.2 | Add performance monitoring (Flipper/Sentry) | 4h | Measurable metrics |
| 5.3 | Implement dynamic text sizing (maxFontSizeMultiplier) | 3h | Accessibility |
| 5.4 | Build onboarding tour for new users | 6h | Activation improvement |
| 5.5 | Add long-press quick actions on cards | 3h | Power user feature |
| 5.6 | Refactor folder structure to match recommended architecture | 8h | Long-term maintainability |

---

## Appendix: Recommended Package Additions

```json
{
  "dependencies": {
    "expo-haptics": "~14.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.24.0",
    "lottie-react-native": "^7.0.0",
    "@gorhom/bottom-sheet": "^5.0.0"
  }
}
```

> **Note:** `react-native-gesture-handler` and `react-native-reanimated` are already peer dependencies of `react-navigation` — they may be partially installed but unused in application code.

---

*End of Audit*
