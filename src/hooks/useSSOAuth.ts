import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useSSO } from "@clerk/clerk-expo";
import * as Sentry from "@sentry/react-native";

// Only the two OAuth strategies enabled on this Clerk instance
// (verified via /v1/environment: oauth_google + oauth_apple).
type SSOStrategy = "oauth_google" | "oauth_apple";

/**
 * Wraps Clerk's `useSSO` for the app's single combined sign-in-or-up flow.
 * `useSSO` itself handles the browser hand-off, the `transferable` → sign-up
 * transfer, and stale `session_exists` retries, so this hook only has to
 * activate the resulting session and route the user onward.
 */
export function useSSOAuth() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [pending, setPending] = useState<SSOStrategy | null>(null);

  const authenticate = useCallback(
    async (strategy: SSOStrategy) => {
      if (pending) return;
      setPending(strategy);
      try {
        const { createdSessionId, setActive, authSessionResult } =
          await startSSOFlow({ strategy });

        // User dismissed the auth browser — treat as a no-op, not an error.
        if (authSessionResult?.type !== "success") return;

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace("/home");
        }
      } catch (err) {
        // Real failures only — cancellation is handled above.
        Sentry.captureException(err);
      } finally {
        setPending(null);
      }
    },
    [pending, startSSOFlow, router],
  );

  return {
    /** The strategy currently in flight, or null when idle. */
    pending,
    signInWithGoogle: () => authenticate("oauth_google"),
    signInWithApple: () => authenticate("oauth_apple"),
  };
}
