import "../../global.css";

import { useEffect } from "react";
import { Stack, useNavigationContainerRef } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import * as Sentry from "@sentry/react-native";

// Tracks screen transitions as spans. Created outside the component so it can
// be handed to Sentry.init and later bound to the navigation container.
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  // Attach request headers, user IP, etc. Set false to reduce PII collected.
  sendDefaultPii: true,
  // Capture 100% of transactions in dev; lower this before shipping to prod.
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
});

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

// Sentry.wrap enables automatic error boundary + touch/profiling instrumentation.
export default Sentry.wrap(RootLayout);
