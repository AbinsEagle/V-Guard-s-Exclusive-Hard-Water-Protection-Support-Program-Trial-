# V-Guard Hard Water Protection App

A modular React Native (Expo) mobile app for the V-Guard Exclusive Hard Water Protection Support Program.

## Tech Stack

- **Framework**: React Native + [Expo SDK 52](https://expo.dev)
- **Routing**: Expo Router (file-based, like Next.js)
- **Language**: TypeScript (strict)

## Project Structure

```
├── app/                        # Expo Router screens (file = route)
│   ├── _layout.tsx             # Root layout — fonts, splash, providers
│   ├── +not-found.tsx          # 404 fallback
│   └── (tabs)/                 # Bottom tab group
│       ├── _layout.tsx         # Tab bar config
│       ├── index.tsx           # Home screen
│       ├── services.tsx        # Services & plans
│       ├── support.tsx         # Support & FAQs
│       └── settings.tsx        # App settings
│
├── src/                        # All application logic
│   ├── components/
│   │   ├── common/             # Reusable primitives (Button, Card, AppText)
│   │   ├── layout/             # Layout wrappers (Screen)
│   │   └── features/           # Domain components (WaterQualityCard, AlertBanner…)
│   │
│   ├── hooks/                  # Custom React hooks (useWaterStatus…)
│   ├── services/
│   │   ├── api/                # HTTP client + typed endpoint functions
│   │   └── storage/            # Async key-value storage helpers
│   ├── theme/                  # colors, spacing, typography — single source of truth
│   ├── types/                  # Shared TypeScript interfaces & enums
│   └── utils/                  # Pure helpers (formatters, constants)
│
└── assets/images/              # App icons, splash, images
```

## Getting Started

```bash
npm install
npm start          # Expo dev server
npm run android    # Android emulator / device
npm run ios        # iOS simulator (macOS only)
npm run web        # Browser
```

## Adding a New Screen

1. Create `app/(tabs)/my-screen.tsx`
2. Add a `<Tabs.Screen>` entry in `app/(tabs)/_layout.tsx`
3. Reuse components from `src/components/` and data from `src/hooks/`

## Adding a New Component

- **Primitive / reusable** → `src/components/common/`
- **Domain-specific** → `src/components/features/`
- Export it via the folder's `index.ts`

## API Integration

Replace the mock data in `src/hooks/useWaterStatus.ts` with a real call:

```ts
import { waterApi } from '../services';

const { data } = await waterApi.getStatus();
```
