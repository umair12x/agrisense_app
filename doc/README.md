# AgriSense Docs

This folder contains project documentation for developers working on AgriSense.

## What This Project Includes

- Mobile app built with Expo + React Native
- AI-powered disease detection flow
- RAG-based agriculture assistant
- Community module with authentication and posting
- Soil and dashboard visualization modules

## Recommended Reading Order

1. `../README.md` for project overview and quick start
2. `../API_SETUP.md` for backend and network troubleshooting
3. `src/utils/api.js` for runtime endpoint resolution logic
4. `src/services/storageService.js` for persistence/auth storage behavior

## Local Development Checklist

1. Install dependencies with `pnpm install`
2. Configure `.env` values for your backend services
3. Start app with `pnpm start`
4. Test key flows:
   - Disease image pick and analysis
   - Assistant ask/translate/speak
   - Community auth, create post, like, comment

## Backend Endpoint Contract (Current Usage)

### App API (`APP_API_BASE_URL`)

- `POST /auth/login`
- `POST /auth/signup`
- `GET /posts`
- `POST /posts`
- `DELETE /posts/:id`
- `POST /posts/like`
- `POST /posts/comment`
- `POST /posts/comment/reply`
- `POST /posts/comment/like`

### Disease API (`DISEASE_API_BASE_URL`)

- `GET /health`
- `GET /classes`
- `GET /disease-info/:diseaseName`
- `POST /predict?top_k=3`

### RAG API (`RAG_API_BASE_URL`)

- `GET /health`
- `POST /ask`
- `POST /translate`
- `POST /speak`
- Chat session helpers are referenced in assistant flows and should be supported server-side.

## Environment Variable Reference

Use `.env` in project root:

```env
EXPO_PUBLIC_RAG_API_URL=http://<YOUR_IP>:8001
EXPO_PUBLIC_DISEASE_API_URL=https://agrisence-plant-disease-detection.onrender.com
EXPO_PUBLIC_APP_API_URL=https://agrisence-backend.onrender.com/api
```

Optional fallback names accepted in code:

- `NEXT_PUBLIC_RAG_API_URL`
- `NEXT_PUBLIC_DISEASE_API_URL`
- `NEXT_PUBLIC_APP_API_URL`

## Common Issues and Fixes

- API works on browser but not on phone:
  - Use LAN IP instead of `localhost`.
  - Confirm phone and dev machine are on same network.
- Auth not persisting:
  - Verify SecureStore availability and fallback in `storageService`.
- Image capture/pick failing:
  - Check camera and media permissions.
  - Confirm `expo-image-picker` plugin exists in `app.json`.

## Suggested Future Docs

- `doc/ARCHITECTURE.md` for module and data flow diagrams
- `doc/DEPLOYMENT.md` for backend + app release process
- `doc/TESTING.md` for manual and automated test strategy
