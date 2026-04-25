export type CEFRLevel = "A1" | "A2" | "B1" | "B2";

export type Word = {
  id: string;
  word: string;
  language_code: string;
  cefr_level: CEFRLevel;
  turkish_meaning: string;
  word_type: string;
  example_sentence: string;
  example_sentence_tr: string;
  source_tag: string;
  is_active: boolean;
  created_at: string;
};
