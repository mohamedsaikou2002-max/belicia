# Belicia for Android

This is the **existing Belicia React/Vite app**, packaged as an installable Android application with Capacitor 8. The compiled interface is bundled locally in the APK. It is not a remote-site shortcut. Supabase edge functions, AI models, synced data, and connected home services still require the corresponding server infrastructure and network access.

## Get the debug APK

1. Open the repository Actions tab and select **Belicia Android APK**.
2. Open a successful workflow run on the Android branch (or trigger **Run workflow**).
3. Under **Artifacts**, download **belicia-android-debug-apk**.
4. Extract `app-debug.apk`, transfer to Android, and install it. Android may require permission to install from that file source.

A **debug APK is for personal testing**, not Play Store distribution. Release distribution requires a private signing keystore and a signed release APK/AAB. Never commit signing credentials or server-side API keys.

## Developer build on a laptop

Requirements: Node.js 22+, JDK 21, Android SDK 36 and Android Studio with the Android SDK installed.

```bash
npm install
npm run android:add  # first time only
npm run android:sync # after each frontend change
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.

The Capacitor configuration uses `com.graycompany.belicia`. Update the application ID **before publishing** if a different package namespace is needed. Keep Android project changes under version control once the generated native project is customized.

## Compatibility and limitations

- Routing uses HashRouter only inside Android; the web deployment keeps BrowserRouter.
- Existing modules, including AI chat, Intel Compressor, briefs, Game Theory, Eagle Eye and profile, remain in the bundle.
- Browser Push API service workers are disabled in the Android shell. Native push would require Firebase Cloud Messaging and a native plugin with device registration/permissions.
- SpeechRecognition in Android WebView is not guaranteed. Testing on physical Android hardware is required before claiming voice input works; consider a native speech plugin later.
- Authentication persists using the existing browser-compatible Supabase client. Any OAuth flows should be verified with mobile redirects before production release.
- Offline launch works for bundled UI, but AI/cloud functions and synchronization are online services; offline inference is not part of this conversion.
- Existing Supabase URL and public/anon key are configured by the current Vite environment. Do not put service-role tokens, LLM vendor keys or private credentials into variables prefixed `VITE_`.
- The committed `.env` presently holds frontend Supabase identifiers. Audit it before any visibility change or publication.

## Build validation

The workflow runs Vite production compilation, Capacitor Android project generation/sync, and Android Gradle `assembleDebug`. A successful APK artifact proves compilation, not backend availability or physical-device end-to-end behavior.
