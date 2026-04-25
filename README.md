# WordCraft AI

## Environment variables

1. Copy `.env.example` to `.env`.
2. Set the required values:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for server-side seed script only)

> Never commit real keys to git. `.env` is ignored, and only `.env.example` should be committed.

## Run the seed script

This script reads `supabase/seed_words.json` and inserts words into the `words` table.
It safely avoids duplicates by `language_code + word`.

```bash
npm run seed:words
```

The script prints:
- inserted count
- skipped count
- error count
