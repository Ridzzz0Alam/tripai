import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoogleIcon, AppleIcon } from "@/components/auth-icons";

const authBg = require("@/assets/images/auth-bg.png");

// Colour the hero image fades into, and the base of the screen gradient.
const TEAL = "#04333F";
const CORAL = "#F2543C";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: TEAL }}>
      <StatusBar style="light" />

      {/* Base darkening gradient behind everything. */}
      <LinearGradient
        colors={["#075063", TEAL, "#02252F"]}
        locations={[0.42, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero image, top-anchored, fading into the teal background. */}
      <View style={styles.hero}>
        <Image
          source={authBg}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
        />
        <LinearGradient
          colors={["transparent", "transparent", TEAL]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Foreground content, anchored to the bottom. */}
      <View
        className="flex-1 px-8"
        style={{ justifyContent: "flex-end", paddingBottom: insets.bottom + 24 }}
      >
        <View className="items-center">
          <Text style={styles.heading}>Dream Trips,{"\n"}Made Effortless</Text>
          <Text style={styles.subtitle}>
            Let AI craft personalized itineraries just for you.
          </Text>

          <View className="flex-row" style={{ marginTop: 26 }}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Primary CTA */}
        <Pressable style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Continue</Text>
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center" style={{ marginTop: 26, marginBottom: 26 }}>
          <View style={styles.rule} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.rule} />
        </View>

        {/* Social CTAs */}
        <Pressable style={styles.socialBtn}>
          <GoogleIcon size={22} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>
        <Pressable style={[styles.socialBtn, { marginTop: 16 }]}>
          <AppleIcon size={22} color="#000" />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 33,
    lineHeight: 39,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  primaryBtn: {
    marginTop: 34,
    height: 60,
    borderRadius: 18,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: CORAL,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  orText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    marginHorizontal: 14,
  },
  socialBtn: {
    height: 56,
    borderRadius: 16,
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
  socialText: {
    color: "#1A1A22",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 12,
  },
});
