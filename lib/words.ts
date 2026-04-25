import { getAllowedLevels } from "@/constants/cefr";
import { supabase } from "@/lib/supabase";
import { CEFRLevel, Word } from "@/types/word";

function shuffle<T>(items: T[]): T[] {
  const array = [...items];

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

export async function fetchUnseenWords(
  userId: string,
  targetLevel: CEFRLevel,
  learningLanguage: string,
  limit: number
): Promise<Word[]> {
  if (!userId) {
    throw new Error("Missing user id while fetching unseen words.");
  }

  if (!learningLanguage) {
    throw new Error("Missing learning language while fetching unseen words.");
  }

  if (limit <= 0) {
    throw new Error("Limit must be greater than 0 when fetching unseen words.");
  }

  const allowedLevels = getAllowedLevels(targetLevel);

  const { data: seenWordRows, error: seenWordError } = await supabase
    .from("user_words")
    .select("word_id")
    .eq("user_id", userId);

  if (seenWordError) {
    throw new Error(`Failed to load seen words: ${seenWordError.message}`);
  }

  const seenWordIds = (seenWordRows ?? []).map((row) => row.word_id as string);

  let query = supabase
    .from("words")
    .select(
      "id, word, language_code, cefr_level, turkish_meaning, word_type, example_sentence, example_sentence_tr, source_tag, is_active, created_at"
    )
    .eq("is_active", true)
    .eq("language_code", learningLanguage)
    .in("cefr_level", allowedLevels);

  if (seenWordIds.length > 0) {
    const escapedIds = seenWordIds.map((id) => `"${id}"`).join(",");
    query = query.not("id", "in", `(${escapedIds})`);
  }

  const { data: candidateWords, error: candidateWordsError } = await query;

  if (candidateWordsError) {
    throw new Error(`Failed to load candidate words: ${candidateWordsError.message}`);
  }

  const unseenWords = (candidateWords ?? []) as Word[];

  if (unseenWords.length < limit) {
    throw new Error(
      `Not enough unseen words available for level ${targetLevel}. Requested ${limit}, but only ${unseenWords.length} words are available.`
    );
  }

  return shuffle(unseenWords).slice(0, limit);
}
