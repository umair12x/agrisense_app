# AgriSense App

AgriSense is a React Native + Expo mobile application for smart agriculture. It combines plant disease detection, soil monitoring visuals, an AI farming assistant, and a farmer community feed in one app.

## Features

- Home overview with platform modules and impact stats
- Dashboard with soil trend visualization, alerts, and quick actions
- Disease detection from leaf images using backend AI inference
- Soil monitoring screen with NPK, pH, moisture, and recommendations
- AI assistant with multilingual support, source references, and chat sessions
- Community feed with posting, likes, comments, media uploads, and auth modal
- Persistent storage with AsyncStorage + SecureStore fallback handling

## Tech Stack

- Expo SDK 54
- React 19 + React Native 0.81
- React Navigation (bottom tabs)
- `expo-image-picker`, `expo-av`, `expo-secure-store`
- `@react-native-async-storage/async-storage`
- `react-native-chart-kit`

## Project Structure

```text
.
|- App.js
|- AppTabs.jsx
|- NavigationTabs.jsx
|- src/
|  |- components/
|  |- screens/
|  |- services/
|  |- utils/
|  |- styles/
|- doc/
|- API_SETUP.md
```

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Expo CLI (optional, `npx expo` works)
- Android emulator / iOS simulator / Expo Go

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

If you use npm:

```bash
npm install
```

2. Start Expo:

```bash
pnpm start
```

3. Run on a target:

```bash
pnpm android
pnpm ios
pnpm web
```

## Available Scripts

- `pnpm start`: start Expo dev server
- `pnpm android`: open Android target
- `pnpm ios`: open iOS target
- `pnpm web`: run web target

## Environment Variables

Create a `.env` file in the project root for custom backend endpoints.

```env
EXPO_PUBLIC_RAG_API_URL=http://<YOUR_IP>:8001
EXPO_PUBLIC_DISEASE_API_URL=https://agrisence-plant-disease-detection.onrender.com
EXPO_PUBLIC_APP_API_URL=https://agrisence-backend.onrender.com/api

# Optional compatibility keys used in utility fallback logic
NEXT_PUBLIC_RAG_API_URL=
NEXT_PUBLIC_DISEASE_API_URL=
NEXT_PUBLIC_APP_API_URL=
```

Notes:
- `src/utils/api.js` resolves RAG API dynamically in development, including LAN host usage for Expo Go.
- Default fallbacks are already defined for disease and app APIs.
- On Android/emulator or physical devices, `localhost` usually does not work for remote APIs.

## API and Service Notes

- App/community/auth API base: `APP_API_BASE_URL`
- Disease inference API base: `DISEASE_API_BASE_URL`
- Assistant (RAG) API base: `RAG_API_BASE_URL`
- Community expects endpoints like:
  - `GET /posts`
  - `POST /posts`
  - `POST /posts/like`
  - `POST /posts/comment`
  - `POST /auth/login`
  - `POST /auth/signup`

## Permissions and Native Config

`app.json` already includes:
- `expo-image-picker` plugin with camera and photo permission strings
- `expo-secure-store` plugin
- Android cleartext traffic enabled for local networking in development

## Troubleshooting

- Network request failures:
  - Confirm API URLs are reachable from your device/emulator.
  - Use your machine LAN IP for local servers, not `localhost`.
- Auth/session issues:
  - Check token/user keys in secure storage and AsyncStorage fallback behavior.
- Image picker issues in Expo Go:
  - Ensure camera/media permissions are granted.

For detailed API troubleshooting and examples, see `API_SETUP.md`.

## Documentation

- Main docs hub: `doc/README.md`
- API setup and known issues: `API_SETUP.md`

## Version

Current package version: `5.2.1`
