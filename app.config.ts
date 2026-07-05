import type { ConfigContext, ExpoConfig } from "expo/config";

// Dynamic config: extends the static app.json and injects secrets from the
// environment so Google Maps keys and the API origin are never committed.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "tripai",
  slug: config.slug ?? "tripai",
  web: {
    ...config.web,
    // Required for Expo Router API routes (generates a server bundle).
    output: "server",
  },
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "com.tripai.app",
    config: {
      ...(config.ios?.config ?? {}),
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY,
    },
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      // Apple requires a usage string; photos come from the library picker.
      NSPhotoLibraryUsageDescription:
        "TripAI needs access to your photos so you can add pictures to your trips.",
    },
  },
  android: {
    ...config.android,
    package: "com.tripai.app",
    config: {
      ...(config.android?.config ?? {}),
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY,
      },
    },
  },
  plugins: [
    // expo-secure-store and @sentry/react-native are managed in app.json by
    // `expo install`. Here we add only plugins that need env injection or aren't
    // auto-added.
    ...(config.plugins ?? []),
    [
      "expo-router",
      {
        // Native builds call API routes at this origin. In local dev this is
        // ignored in favor of the running dev server.
        origin: process.env.EXPO_PUBLIC_API_ORIGIN,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "TripAI needs access to your photos so you can add pictures to your trips.",
      },
    ],
  ],
});
