import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

type UserProfile = {
  target_level: string | null;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (signInError) {
        setErrorMessage(signInError.message);
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        setErrorMessage("Login succeeded, but user data was missing.");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("target_level")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setErrorMessage(profileError.message);
        return;
      }

      const profile = profileData as UserProfile | null;

      if (!profile?.target_level) {
        router.replace(ROUTES.CHOOSE_LEVEL);
        return;
      }

      router.replace(ROUTES.HOME);
    } catch {
      setErrorMessage("Unexpected error occurred while logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in to continue your WordCraft AI journey.</Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={email}
        />

        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#6b7280"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable disabled={loading} onPress={handleLogin} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{loading ? "Logging in..." : "Login"}</Text>
        </Pressable>

        <Link href={ROUTES.REGISTER} asChild>
          <Pressable disabled={loading} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Create an account</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.background
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 20,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: "#fff"
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600"
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14
  }
});
