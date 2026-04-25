import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { CEFRLevel } from "@/types/word";

type UserProfile = {
  target_level: CEFRLevel | null;
};

type DashboardStats = {
  totalWordsStudied: number;
  totalSentencesWritten: number;
  needsReview: number;
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [targetLevel, setTargetLevel] = useState<CEFRLevel | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalWordsStudied: 0,
    totalSentencesWritten: 0,
    needsReview: 0
  });

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError) {
          if (isActive) {
            setErrorMessage(userError.message);
          }
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
          if (isActive) {
            setErrorMessage(profileError.message);
          }
          return;
        }

        const profile = profileData as UserProfile | null;

        if (!profile?.target_level) {
          router.replace(ROUTES.CHOOSE_LEVEL);
          return;
        }

        const [
          { count: totalWords, error: totalWordsError },
          { count: totalSentences, error: totalSentencesError },
          { count: needsReview, error: needsReviewError }
        ] = await Promise.all([
          supabase.from("user_words").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase
            .from("sentence_attempts")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("user_words")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "needs_review")
        ]);

        const firstError = totalWordsError || totalSentencesError || needsReviewError;

        if (firstError) {
          if (isActive) {
            setErrorMessage(firstError.message);
          }
          return;
        }

        if (!isActive) return;

        setTargetLevel(profile.target_level);
        setStats({
          totalWordsStudied: totalWords ?? 0,
          totalSentencesWritten: totalSentences ?? 0,
          needsReview: needsReview ?? 0
        });
      } catch {
        if (isActive) {
          setErrorMessage("Unexpected error occurred while loading your dashboard.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>

        {loading ? <Text style={styles.subtitle}>Loading your dashboard...</Text> : null}

        {!loading && errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {!loading && !errorMessage ? (
          <>
            <Text style={styles.subtitle}>Target level: {targetLevel}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total words studied</Text>
                <Text style={styles.statValue}>{stats.totalWordsStudied}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total sentences written</Text>
                <Text style={styles.statValue}>{stats.totalSentencesWritten}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Needs review</Text>
                <Text style={styles.statValue}>{stats.needsReview}</Text>
              </View>
            </View>
          </>
        ) : null}

        <Pressable onPress={() => router.push(ROUTES.WORD_COUNT)} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start New Practice</Text>
        </Pressable>

        <Pressable onPress={() => router.push(ROUTES.PROGRESS)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Progress</Text>
        </Pressable>

        <Pressable onPress={() => router.push(ROUTES.SETTINGS)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Settings</Text>
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
    color: "#4b5563"
  },
  statsGrid: {
    gap: 10,
    marginTop: 6,
    marginBottom: 2
  },
  statCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff"
  },
  statLabel: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: "700"
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6
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
