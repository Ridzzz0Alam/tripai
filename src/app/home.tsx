import { View, Text, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Redirect } from "expo-router";
import { useAuth, useUser, useClerk } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TEAL = "#04333F";
const CORAL = "#F2543C";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Guard: a signed-out user (e.g. right after sign-out) goes back to auth.
  if (isLoaded && !isSignedIn) {
    return <Redirect href="/" />;
  }

  const name =
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "traveler";

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{
        backgroundColor: TEAL,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <StatusBar style="light" />

      <Text style={styles.eyebrow}>You're signed in</Text>
      <Text style={styles.title}>Welcome, {name}</Text>

      <Pressable
        style={styles.signOut}
        android_ripple={{ color: "rgba(255,255,255,0.15)" }}
        onPress={() => signOut()}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 40,
  },
  signOut: {
    height: 54,
    paddingHorizontal: 40,
    borderRadius: 15,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
