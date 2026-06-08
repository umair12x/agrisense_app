# Production APK with EAS

This project is configured for **Expo Application Services (EAS)** Android APK builds with production API environment variables.

## What is already set up

| Item | Details |
|------|---------|
| `eas.json` | `production` profile → `buildType: "apk"` |
| `app.config.js` | Loads `.env` / `.env.production` for `EXPO_PUBLIC_*` vars |
| `.env` | Production API URLs (local, gitignored) |
| `.env.example` | Template to copy |
| EAS project | `@hamna26/agrisenseapp` |
| EAS env | Variables pushed to **production** environment on Expo |

### Bundled environment variables (APK)

These are set in three places (all must match `.env.example`):

1. **EAS production environment** (verified on Expo dashboard)
2. **`eas.json`** production profile `env` block
3. **`app.config.js` → `expo.extra`** — **this is what the APK reads at runtime** (most reliable)

Variables:

- `EXPO_PUBLIC_RAG_API_URL` → `extra.ragApiUrl`
- `EXPO_PUBLIC_DISEASE_API_URL` → `extra.diseaseApiUrl`
- `EXPO_PUBLIC_APP_API_URL` → `extra.appApiUrl`
- Optional: `EXPO_PUBLIC_CLOUDINARY_*` (community uploads only)

## One-time: Android signing (required)

The first cloud build must create an Android keystore. **Run this in your own terminal** (interactive prompt):

```bash
cd c:\Users\Umair Imran\Desktop\agrisenseapp
pnpm install
npx eas build --platform android --profile production
```

When asked **"Generate a new Android Keystore?"** → choose **Yes**.

EAS stores the keystore on Expo servers for future builds.

## Build production APK

```bash
pnpm run build:apk
```

Or:

```bash
npx eas build --platform android --profile production
```

After the build finishes, download the `.apk` from the link in the terminal or from:

https://expo.dev/accounts/hamna26/projects/agrisenseapp/builds

## Update environment variables

1. Edit `.env` in the project root.
2. Push to EAS:

```bash
pnpm run eas:env:push
```

3. Run a new build so the APK picks up the new values.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm run build:apk` | Cloud production APK |
| `pnpm run build:apk:local` | Local build (macOS/Linux only) |
| `pnpm run eas:env:push` | Upload `.env` to EAS production |

## Notes

- **Windows**: Cloud EAS build is supported; local `--local` builds require macOS or Linux.
- Change `EXPO_ANDROID_PACKAGE` in `.env` before the first store release if you need a different application ID.
- Increment `EXPO_ANDROID_VERSION_CODE` for each Play Store upload.
