import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { CEFRLevel } from "@/types/word";

const WORD_COUNT_OPTIONS = [3, 5, 10, 20] as const;

type UserProfile = {
  target_level: CEFRLevel | null;
};

type PracticeSessionInsert = {
  id: string;
};

export default function WordCountScreen() {
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isStartDisabled = useMemo(() => !selectedCount || loading, [selectedCount, loading]);

  async function handleStartPractice() {
    if (!selectedCount) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        setErrorMessage(userError.message);
        return;
      }

      if (!user) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("target_level")
        .eq("id", user.id)
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

      const { data: sessionData, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: user.id,
          word_count: selectedCount,
          status: "started"
        })
        .select("id")
        .single();

      if (sessionError) {
        setErrorMessage(sessionError.message);
        return;
      }

      const session = sessionData as PracticeSessionInsert | null;

      if (!session?.id) {
        setErrorMessage("Practice session created, but session id is missing.");
        return;
      }

      router.push({
        pathname: ROUTES.PRACTICE,
        params: {
          session_id: session.id,
          word_count: String(selectedCount)
        }
      });
    } catch {
      setErrorMessage("Unexpected error occurred while starting your practice session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>How many words do you want to study today?</Text>
        <Text style={styles.subtitle}>Recommended: 10 words per session</Text>

        <View style={styles.optionsList}>
          {WORD_COUNT_OPTIONS.map((count) => {
            const isSelected = selectedCount === count;

            return (
              <Pressable
                key={count}
                onPress={() => setSelectedCount(count)}
                style={[styles.optionButton, isSelected ? styles.optionButtonSelected : null]}
              >
                <Text style={[styles.optionButtonText, isSelected ? styles.optionButtonTextSelected : null]}>
                  {count} {count === 1 ? "Word" : "Words"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable disabled={isStartDisabled} onPress={handleStartPractice} style={[styles.primaryButton, isStartDisabled ? styles.primaryButtonDisabled : null]}>
          <Text style={styles.primaryButtonText}>{loading ? "Starting..." : "Start Practice"}</Text>
        </Pressable>

        <Pressable disabled={loading} onPress={() => router.replace(ROUTES.HOME)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </Pressable>
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
  optionsList: {
    gap: 10
  },
  optionButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff"
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "#eef2ff"
  },
  optionButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500"
  },
  optionButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: "700"
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6
  },
  primaryButtonDisabled: {
    opacity: 0.5
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
