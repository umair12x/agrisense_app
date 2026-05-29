# AgriSense Architecture

This document describes the high-level architecture of the AgriSense mobile app, key modules, runtime data flow, and external service dependencies.

## 1. System Overview

AgriSense is an Expo + React Native client application with a modular screen-based UI. The app interacts with three backend domains:

- App API: authentication and community features
- Disease API: image-based plant disease inference
- RAG API: AI assistant, translation, text-to-speech, and chat sessions

The app uses local persistence via AsyncStorage and SecureStore with graceful fallback logic.

## 2. High-Level Diagram

```mermaid
flowchart TD
  User[User] --> UI[React Native UI]

  UI --> Nav[Navigation Container + Bottom Tabs]
  Nav --> Home[Home Screen]
  Nav --> Dashboard[Dashboard Screen]
  Nav --> Disease[Disease Screen]
  Nav --> Soil[Soil Screen]
  Nav --> Assistant[Assistant Screen]
  Nav --> Community[Community Screen]

  Disease --> DiseaseAPI[Plant Disease API]
  Assistant --> RAGAPI[RAG Assistant API]
  Community --> AppAPI[App Backend API]
  Assistant --> AppAPI

  UI --> Storage[storageService]
  Storage --> Async[@react-native-async-storage/async-storage]
  Storage --> Secure[expo-secure-store]
```

## 3. Frontend Layers

### 3.1 App Shell and Navigation

- `App.js`
  - Provides `SafeAreaProvider`, `StatusBar`, and top-level `NavigationContainer`
- `AppTabs.jsx`
  - Registers tab routes and screen components
  - Wraps Community screen with auth modal injection
- `NavigationTabs.jsx`
  - Custom bottom tab bar UI and route switching

### 3.2 Screen Layer

- `src/screens/HomeScreen.jsx`
  - Product overview, key modules, impact messaging
- `src/screens/DashboardScreen.jsx`
  - Aggregated stats, alerts, trends, quick actions
- `src/screens/DiseaseScreen.jsx`
  - Image pick/capture, disease analysis, recommendations
- `src/screens/SoilScreen.jsx`
  - Soil metric visualization and recommendation logic
- `src/screens/AssistantScreen.jsx`
  - AI chat, language features, voice output, session management
- `src/screens/CommunityScreen.jsx`
  - Post feed, create/like/comment flows, auth-gated actions

### 3.3 Shared Components and Services

- `src/components/AuthModal.jsx`
  - Sign-in/sign-up modal used for auth-required actions
- `src/services/storageService.js`
  - Unified storage interface
  - Uses SecureStore for sensitive keys (`token`, `user`)
  - Uses AsyncStorage for general persistence
  - Falls back to in-memory storage when native modules are unavailable

### 3.4 Utility Layer

- `src/utils/api.js`
  - API base URL resolution
  - HTTP helpers for disease and RAG endpoints
  - Environment-aware host selection in development
- `src/utils/cloudinary.js`
  - Media upload and media URL validation helpers
- `src/utils/fileHandlers.js`
  - File conversion, validation, upload helpers

## 4. API Domains and Responsibilities

### 4.1 App API (`APP_API_BASE_URL`)

Purpose:
- Authentication
- Community content lifecycle

Representative endpoints:
- `POST /auth/login`
- `POST /auth/signup`
- `GET /posts`
- `POST /posts`
- `DELETE /posts/:id`
- `POST /posts/like`
- `POST /posts/comment`
- `POST /posts/comment/reply`
- `POST /posts/comment/like`

### 4.2 Disease API (`DISEASE_API_BASE_URL`)

Purpose:
- Plant disease prediction and metadata

Representative endpoints:
- `GET /health`
- `GET /classes`
- `GET /disease-info/:diseaseName`
- `POST /predict?top_k=3`

### 4.3 RAG API (`RAG_API_BASE_URL`)

Purpose:
- Agriculture assistant responses from document-grounded context
- Translation and speech output
- Session-oriented assistant flows

Representative endpoints:
- `GET /health`
- `POST /ask`
- `POST /translate`
- `POST /speak`

## 5. Runtime Data Flows

### 5.1 Authentication Flow

1. User opens auth modal from gated feature.
2. Client sends credentials to App API (`/auth/login` or `/auth/signup`).
3. On success, token and user payload are stored via `storageService`.
4. Screens consume stored auth state for protected actions.

### 5.2 Disease Detection Flow

1. User picks image from gallery or captures with camera.
2. Screen normalizes image asset (`uri`, `type`, `name`).
3. Client posts multipart form data to Disease API `/predict`.
4. Top prediction is rendered; optional disease detail request enriches output.

### 5.3 Assistant Flow

1. User sends a message in selected language.
2. Client posts prompt and chat history to RAG API `/ask`.
3. Response is rendered with source indicators when available.
4. Optional follow-up actions:
   - Translate response via `/translate`
   - Generate speech via `/speak`

### 5.4 Community Feed Flow

1. Client fetches posts from App API.
2. User interactions (post/like/comment/delete) use optimistic UI updates.
3. Server response confirms or client reverts optimistic state on failure.
4. Cached/local state is used as resilience fallback when network fails.

## 6. Configuration Model

The app supports runtime configuration from environment variables and fallback defaults.

Primary variables:

- `EXPO_PUBLIC_APP_API_URL`
- `EXPO_PUBLIC_DISEASE_API_URL`
- `EXPO_PUBLIC_RAG_API_URL`

Compatibility variables also supported:

- `NEXT_PUBLIC_APP_API_URL`
- `NEXT_PUBLIC_DISEASE_API_URL`
- `NEXT_PUBLIC_RAG_API_URL`

Notes:
- In Expo development mode, RAG host can be derived from the Expo dev host IP.
- Device/emulator networking should use LAN IP, not `localhost`, for machine-hosted services.

## 7. Security and Resilience

- Sensitive auth material is stored in SecureStore when available.
- AsyncStorage failures are handled gracefully; in-memory fallback prevents startup crashes.
- UI operations in networked flows use defensive error handling and user-facing feedback.
- Community actions include optimistic updates with revert behavior when requests fail.

## 8. Current Architectural Tradeoffs

- Monolithic screen files contain substantial UI + data logic, which speeds iteration but increases complexity.
- Some utility helpers include web-centric patterns and may need tightening for native-only behavior.
- Assistant and community modules currently blend persistence/network concerns in screen layer.

## 9. Suggested Evolution Path

1. Introduce feature folders with `components`, `hooks`, and `services` per domain.
2. Centralize API clients by domain (app, disease, rag) with typed response contracts.
3. Add explicit state management boundaries for auth/session/feed state.
4. Add integration tests for disease, assistant, and community critical paths.
5. Extract reusable UI primitives for cards, badges, and action rows.

## 10. Related Docs

- `README.md`
- `doc/README.md`
- `API_SETUP.md`
