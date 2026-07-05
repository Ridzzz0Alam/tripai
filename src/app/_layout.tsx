import "../../global.css";

import { useEffect } from "react";
import { Stack, useNavigationContainerRef } from "expo-router";
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

  return <Stack />;
}

// Sentry.wrap enables automatic error boundary + touch/profiling instrumentation.
export default Sentry.wrap(RootLayout);
