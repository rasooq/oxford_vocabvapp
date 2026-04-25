import { CEFRLevel } from "@/types/word";

export const CEFR_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2"];

export const CEFR_ORDER: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4
};

export function getAllowedLevels(targetLevel: CEFRLevel): CEFRLevel[] {
  return CEFR_LEVELS.filter((level) => CEFR_ORDER[level] <= CEFR_ORDER[targetLevel]);
}
