import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import { theme } from "@/lib/theme";
import { CEFRLevel } from "@/types/word";

type AttemptResult = {
  word_id: string;
  word: string;
  cefr_level: CEFRLevel;
  turkish_meaning: string;
  word_type: string;
  user_sentence: string;
};

function parseAttemptsParam(attemptsParam: string | string[] | undefined): AttemptResult[] {
  const normalized = Array.isArray(attemptsParam) ? attemptsParam[0] : attemptsParam;

  if (!normalized) {
    throw new Error("Missing attempts data.");
  }

  const parsed = JSON.parse(normalized);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid attempts data.");
  }

  const normalizedAttempts = parsed.map((item) => ({
    word_id: item?.word_id,
    word: item?.word,
    cefr_level: item?.cefr_level,
    turkish_meaning: item?.turkish_meaning,
    word_type: item?.word_type,
    user_sentence: item?.user_sentence
  })) as AttemptResult[];

  const isValid = normalizedAttempts.every(
    (attempt) =>
      attempt.word_id &&
      attempt.word &&
      attempt.cefr_level &&
      attempt.turkish_meaning &&
      attempt.word_type &&
      attempt.user_sentence
  );

  if (!isValid) {
    throw new Error("Attempts payload is incomplete.");
  }

  return normalizedAttempts;
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    session_id?: string;
    attempts?: string | string[];
  }>();

  const sessionId = useMemo(() => {
    const value = params.session_id;
    return Array.isArray(value) ? value[0] : value;
  }, [params.session_id]);

  const attempts = useMemo(() => {
    try {
      return parseAttemptsParam(params.attempts);
    } catch {
      return null;
    }
  }, [params.attempts]);

  if (!sessionId || !attempts) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Your Results</Text>
          <Text style={styles.errorText}>
            Results data is missing or invalid. Please complete a practice session first.
          </Text>

          <Pressable onPress={() => router.replace(ROUTES.HOME)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Finish</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Your Results</Text>
        <Text style={styles.subtitle}>AI evaluation will be connected in the next step.</Text>

        <ScrollView contentContainerStyle={styles.attemptList} style={styles.scrollArea}>
          {attempts.map((attempt) => (
            <View key={attempt.word_id} style={styles.attemptCard}>
              <Text style={styles.wordText}>{attempt.word}</Text>
              <Text style={styles.metaText}>Sentence: {attempt.user_sentence}</Text>
              <Text style={styles.metaText}>Level: {attempt.cefr_level}</Text>
              <Text style={styles.metaText}>Meaning: {attempt.turkish_meaning}</Text>
              <Text style={styles.metaText}>Type: {attempt.word_type}</Text>
            </View>
          ))}
        </ScrollView>

        <Pressable onPress={() => router.replace(ROUTES.HOME)} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Finish</Text>
        </Pressable>

        <Pressable onPress={() => router.push(ROUTES.WORD_COUNT)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Practice More</Text>
        </Pressable>

        <Pressable onPress={() => router.push(ROUTES.PROGRESS)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Go to Progress</Text>
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
    gap: 12,
    flex: 1
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
  scrollArea: {
    flex: 1,
    marginTop: 4
  },
  attemptList: {
    gap: 10,
    paddingBottom: 8
  },
  attemptCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    backgroundColor: "#fff"
  },
  wordText: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text
  },
  metaText: {
    fontSize: 14,
    color: "#4b5563"
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
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
