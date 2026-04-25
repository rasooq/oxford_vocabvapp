#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

async function loadEnvFromDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");

  try {
    const content = await fs.readFile(envPath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const eqIndex = line.indexOf("=");
      if (eqIndex === -1) continue;

      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional; environment variables may already be set in shell/CI.
  }
}

async function readSeedWords() {
  const seedPath = path.resolve(process.cwd(), "supabase", "seed_words.json");
  const raw = await fs.readFile(seedPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("supabase/seed_words.json must contain a JSON array.");
  }

  return parsed;
}

async function run() {
  await loadEnvFromDotEnv();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) environment variable.");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const seedWords = await readSeedWords();

  const wordsByLanguage = new Map();
  for (const item of seedWords) {
    const lang = item.language_code;
    const word = item.word;

    if (!lang || !word) continue;

    if (!wordsByLanguage.has(lang)) {
      wordsByLanguage.set(lang, new Set());
    }

    wordsByLanguage.get(lang).add(word);
  }

  const existingWordKeys = new Set();

  for (const [languageCode, wordSet] of wordsByLanguage.entries()) {
    const words = Array.from(wordSet);

    const { data, error } = await supabase
      .from("words")
      .select("language_code, word")
      .eq("language_code", languageCode)
      .in("word", words);

    if (error) {
      console.error(`Failed to fetch existing words for ${languageCode}:`, error.message);
      throw error;
    }

    for (const row of data ?? []) {
      existingWordKeys.add(`${row.language_code}::${row.word}`);
    }
  }

  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const word of seedWords) {
    const key = `${word.language_code}::${word.word}`;

    if (existingWordKeys.has(key)) {
      skippedCount += 1;
      continue;
    }

    const { error } = await supabase
      .from("words")
      .upsert(word, { onConflict: "language_code,word", ignoreDuplicates: true });

    if (error) {
      errorCount += 1;
      console.error(`Error inserting ${key}:`, error.message);
      continue;
    }

    insertedCount += 1;
  }

  console.log("Seed complete.");
  console.log(`inserted count: ${insertedCount}`);
  console.log(`skipped count: ${skippedCount}`);
  console.log(`error count: ${errorCount}`);

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
