import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { ROUTES } from "@/constants/routes";
import { theme } from "@/lib/theme";
import { CEFRLevel } from "@/types/word";

type PracticeWord = {
  id: string;
  word: string;
  cefr_level: CEFRLevel;
  turkish_meaning: string;
  word_type: string;
};

type AttemptPayload = {
  word_id: string;
  word: string;
  cefr_level: CEFRLevel;
  turkish_meaning: string;
  word_type: string;
  user_sentence: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesTargetWord(sentence: string, word: string): boolean {
  const base = word.trim().toLowerCase();
  const escaped = escapeRegExp(base);
  const pattern = new RegExp(`\\b(${escaped}|${escaped}s|${escaped}ed|${escaped}ing)\\b`, "i");

  return pattern.test(sentence.toLowerCase());
}

function parseWordsParam(wordsParam: string | string[] | undefined): PracticeWord[] {
  const normalized = Array.isArray(wordsParam) ? wordsParam[0] : wordsParam;

  if (!normalized) {
    throw new Error("Missing words data.");
  }

  const parsed = JSON.parse(normalized);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid words data.");
  }

  const normalizedWords = parsed.map((item) => ({
    id: item?.id,
    word: item?.word,
    cefr_level: item?.cefr_level,
    turkish_meaning: item?.turkish_meaning,
    word_type: item?.word_type
  })) as PracticeWord[];

  const isValid = normalizedWords.every(
    (item) => item.id && item.word && item.cefr_level && item.turkish_meaning && item.word_type
  );

  if (!isValid) {
    throw new Error("Words payload is incomplete.");
  }

  return normalizedWords;
}

export default function PracticeScreen() {
  const params = useLocalSearchParams<{
    session_id?: string;
    word_count?: string;
    words?: string | string[];
  }>();

  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [sentenceByWordId, setSentenceByWordId] = useState<Record<string, string>>({});

  const sessionId = useMemo(() => {
    const value = params.session_id;
    return Array.isArray(value) ? value[0] : value;
  }, [params.session_id]);

  const words = useMemo(() => {
    try {
      return parseWordsParam(params.words);
    } catch {
      return null;
    }
  }, [params.words]);

  const targetWordCount = useMemo(() => {
    const value = params.word_count;
    const normalized = Array.isArray(value) ? value[0] : value;
    const parsed = Number(normalized);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return words?.length ?? 0;
    }

    return parsed;
  }, [params.word_count, words?.length]);

  if (!sessionId || !words) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>New Words Practice</Text>
          <Text style={styles.errorText}>
            Practice session data is missing or invalid. Please start again from word count.
          </Text>

          <Pressable onPress={() => router.replace(ROUTES.HOME)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const completedCount = words.filter((word) => (sentenceByWordId[word.id] || "").trim().length > 0).length;
  const allSentencesProvided = completedCount === words.length;

  function updateSentence(wordId: string, value: string) {
    setValidationMessage(null);
    setSentenceByWordId((prev) => ({ ...prev, [wordId]: value }));
  }

  function handleCheckSentences() {
    setValidationMessage(null);

    const attempts: AttemptPayload[] = words.map((word) => ({
      word_id: word.id,
      word: word.word,
      cefr_level: word.cefr_level,
      turkish_meaning: word.turkish_meaning,
      word_type: word.word_type,
      user_sentence: (sentenceByWordId[word.id] || "").trim()
    }));

    const hasIncompleteSentence = attempts.some((attempt) => attempt.user_sentence.split(/\s+/).filter(Boolean).length < 4);

    if (hasIncompleteSentence) {
      setValidationMessage("Please write a complete sentence for every word.");
      return;
    }

    const hasMissingTargetWord = attempts.some(
      (attempt) => !includesTargetWord(attempt.user_sentence, attempt.word)
    );

    if (hasMissingTargetWord) {
      setValidationMessage("Each sentence should use the target word.");
      return;
    }

    router.push({
      pathname: ROUTES.RESULTS,
      params: {
        session_id: sessionId,
        attempts: JSON.stringify(attempts)
      }
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>New Words Practice</Text>
        <Text style={styles.subtitle}>{completedCount} / {targetWordCount || words.length} completed</Text>

        <ScrollView contentContainerStyle={styles.wordList} style={styles.scrollArea}>
          {words.map((word) => (
            <View key={word.id} style={styles.wordCard}>
              <Text style={styles.wordText}>{word.word}</Text>
              <Text style={styles.metaText}>Level: {word.cefr_level}</Text>
              <Text style={styles.metaText}>Meaning: {word.turkish_meaning}</Text>
              <Text style={styles.metaText}>Type: {word.word_type}</Text>

              <TextInput
                multiline
                onChangeText={(value) => updateSentence(word.id, value)}
                placeholder="Write your sentence here..."
                placeholderTextColor="#6b7280"
                style={styles.sentenceInput}
                value={sentenceByWordId[word.id] || ""}
              />
            </View>
          ))}
        </ScrollView>

        {validationMessage ? <Text style={styles.errorText}>{validationMessage}</Text> : null}

        <Pressable
          disabled={!allSentencesProvided}
          onPress={handleCheckSentences}
          style={[styles.primaryButton, !allSentencesProvided ? styles.primaryButtonDisabled : null]}
        >
          <Text style={styles.primaryButtonText}>Check My Sentences</Text>
        </Pressable>

        <Pressable onPress={() => router.replace(ROUTES.HOME)} style={styles.secondaryButton}>
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
  wordList: {
    gap: 10,
    paddingBottom: 8
  },
  wordCard: {
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
  sentenceInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 72,
    color: theme.colors.text,
    textAlignVertical: "top"
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
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
