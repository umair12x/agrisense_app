# AgriSense App

AgriSense is a React Native + Expo mobile application for smart agriculture. It combines cotton plant disease detection, a multilingual AI farming assistant (RAG), and a farmer community feed in one app.

## Features

- **Home** — module overview, theme toggle, live backend health checks
- **Disease detection** — cotton leaf image analysis with treatment tips (5MB limit enforced)
- **AI assistant** — Urdu, Punjabi & English Q&A, TTS listen/stop, chat sessions, shared auth
- **Community** — posts, likes, comments, media uploads, category tags, offline post cache
- **Auth** — email login/signup with shared session across tabs (AuthContext)
- **Theming** — light/dark mode

## Tech Stack

- Expo SDK 54
- React 19 + React Native 0.81
- React Navigation (custom bottom tabs)
- `expo-image-picker`, `expo-audio`, `expo-secure-store`, `expo-file-system`
- `@react-native-async-storage/async-storage`

## Project Structure

```text
.
├── App.js
├── AppTabs.jsx
├── NavigationTabs.jsx
├── app.config.js
├── eas.json
├── src/
│   ├── components/
│   ├── config/
│   ├── context/        # AuthContext
│   ├── screens/
│   ├── services/
│   ├── theme/
│   └── utils/          # api.js, appApi.js, fetchWithRetry.js
└── __tests__/
```

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Expo Go or EAS Build for device testing

## Quick Start

```bash
pnpm install
pnpm start
```

Run on a target:

```bash
pnpm android
pnpm ios
pnpm web
```

## Available Scripts

- `pnpm start` — Expo dev server
- `pnpm android` / `pnpm ios` / `pnpm web` — platform targets
- `pnpm build:apk` — production Android APK via EAS
- `pnpm test` — Jest unit tests

## Backend APIs

Three Render-hosted services (URLs baked in `app.config.js` / `expo.extra`):

| Service | Purpose |
|---------|---------|
| Disease API | Cotton leaf prediction |
| RAG API | Assistant Q&A, translation, TTS |
| Community API | Auth, posts, chat history |

Free-tier cold starts can take up to ~60 seconds. Community and assistant calls use timeouts and retries.

## Production APK

See `EAS_BUILD.md` for environment variables and build steps. After code changes, rebuild:

```bash
pnpm run build:apk
```

## Version

App version **5.2.1** (`package.json` and `app.json` aligned).
