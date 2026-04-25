import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRegister() {
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace(ROUTES.CHOOSE_LEVEL);
    } catch {
      setErrorMessage("Unexpected error occurred while creating your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Create your account to start practicing vocabulary.</Text>

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

        <TextInput
          autoCapitalize="none"
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          placeholderTextColor="#6b7280"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable disabled={loading} onPress={handleRegister} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{loading ? "Creating account..." : "Create Account"}</Text>
        </Pressable>

        <Link href={ROUTES.LOGIN} asChild>
          <Pressable disabled={loading} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
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
