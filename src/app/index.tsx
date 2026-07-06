import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSSOAuth } from "@/hooks/useSSOAuth";

// Background photo pre-composited with the fade into the teal backdrop, plus the
// two brand marks — baked to static assets so no extra native modules are needed.
const authBg = require("@/assets/images/auth-bg-full.png");
const googleIcon = require("@/assets/images/google.png");
const appleIcon = require("@/assets/images/apple.png");

const TEAL = "#04333F";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();
  const { pending, signInWithGoogle, signInWithApple } = useSSOAuth();

  // A persisted session (via tokenCache) sends the user straight to the app.
  if (isLoaded && isSignedIn) {
    return <Redirect href="/home" />;
  }

  const busy = pending !== null;

  return (
    <View className="flex-1" style={{ backgroundColor: TEAL }}>
      <StatusBar style="light" />

      <Image
        source={authBg}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
      />

      {/* Foreground: heading and actions grouped together, centered over the water. */}
      <View className="flex-1 px-8" style={{ paddingBottom: insets.bottom + 28 }}>
        <View style={{ flex: 2 }} />

        <View className="items-center">
          <Text style={styles.heading}>Dream Trips,{"\n"}Made Effortless</Text>
        </View>

        {/* Social CTAs */}
        <View style={{ marginTop: 28 }}>
          <Pressable
            style={[styles.socialBtn, busy && styles.socialBtnPressed]}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            disabled={busy}
            onPress={signInWithGoogle}
          >
            {pending === "oauth_google" ? (
              <ActivityIndicator color="#1A1A22" />
            ) : (
              <>
                <Image source={googleIcon} style={styles.googleIcon} contentFit="contain" />
                <Text style={styles.socialText}>Continue with Google</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={[styles.socialBtn, { marginTop: 16 }, busy && styles.socialBtnPressed]}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            disabled={busy}
            onPress={signInWithApple}
          >
            {pending === "oauth_apple" ? (
              <ActivityIndicator color="#1A1A22" />
            ) : (
              <>
                <Image source={appleIcon} style={styles.appleIcon} contentFit="contain" />
                <Text style={styles.socialText}>Continue with Apple</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.terms}>
            By continuing you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  socialBtn: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  socialBtnPressed: {
    opacity: 0.7,
  },
  socialText: {
    color: "#1A1A22",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 12,
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  appleIcon: {
    width: 19,
    height: 22,
  },
  terms: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 22,
    paddingHorizontal: 8,
  },
  termsLink: {
    color: "#4EA8FF",
    fontWeight: "600",
  },
});
