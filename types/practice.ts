export type EvaluationScore =
  | "Good"
  | "Almost correct"
  | "Needs improvement"
  | "Wrong usage";

export type UserWordStatus =
  | "practiced"
  | "learned"
  | "needs_review";

export type PracticeSession = {
  id: string;
  user_id: string;
  word_count: number;
  status: "started" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

export type UserWord = {
  id: string;
  user_id: string;
  word_id: string;
  first_seen_at: string;
  last_seen_at: string;
  times_seen: number;
  status: UserWordStatus;
  last_score: EvaluationScore | null;
  created_at: string;
};

export type SentenceAttempt = {
  id: string;
  session_id: string;
  user_id: string;
  word_id: string;
  user_sentence: string;
  corrected_sentence: string | null;
  explanation_tr: string | null;
  better_example_sentence: string | null;
  short_tip_tr: string | null;
  score: EvaluationScore | null;
  is_sentence_valid: boolean | null;
  is_word_used_correctly: boolean | null;
  created_at: string;
};
