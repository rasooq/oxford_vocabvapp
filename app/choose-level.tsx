import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CEFR_LEVELS } from "@/constants/cefr";
import { ROUTES } from "@/constants/routes";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { CEFRLevel } from "@/types/word";

const LEVEL_LABELS: Record<CEFRLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate"
};

type ProfileDailyGoal = {
  daily_goal: number | null;
};

export default function ChooseLevelScreen() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSaveDisabled = useMemo(() => !selectedLevel || loading, [selectedLevel, loading]);

  async function handleSave() {
    if (!selectedLevel) return;

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
        setErrorMessage("You need to be logged in to choose a level.");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("daily_goal")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setErrorMessage(profileError.message);
        return;
      }

      const profile = profileData as ProfileDailyGoal | null;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          target_level: selectedLevel,
          learning_language: "en",
          native_language: "tr",
          daily_goal: profile?.daily_goal ?? 10
        })
        .eq("id", user.id);

      if (updateError) {
        setErrorMessage(updateError.message);
        return;
      }

      router.replace(ROUTES.HOME);
    } catch {
      setErrorMessage("Unexpected error occurred while saving your level.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Choose your target level</Text>
        <Text style={styles.subtitle}>We will only show words at your selected level or below.</Text>

        <View style={styles.levelList}>
          {CEFR_LEVELS.map((level) => {
            const isSelected = selectedLevel === level;

            return (
              <Pressable
                key={level}
                onPress={() => setSelectedLevel(level)}
                style={[styles.levelOption, isSelected ? styles.levelOptionSelected : null]}
              >
                <Text style={[styles.levelTitle, isSelected ? styles.levelTitleSelected : null]}>
                  {level} — {LEVEL_LABELS[level]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable disabled={isSaveDisabled} onPress={handleSave} style={[styles.saveButton, isSaveDisabled ? styles.saveButtonDisabled : null]}>
          <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save and Continue"}</Text>
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
  levelList: {
    gap: 10
  },
  levelOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff"
  },
  levelOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "#eef2ff"
  },
  levelTitle: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: "500"
  },
  levelTitleSelected: {
    color: theme.colors.primary,
    fontWeight: "700"
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6
  },
  saveButtonDisabled: {
    opacity: 0.5
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600"
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14
  }
});
