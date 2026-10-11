# One at a Time

Focused dating: one mutual active match per person. Discovery pauses during a match; ending it requires a reason visible to both participants.

The public homepage has clearly marked fictional demo profiles. Real member discovery and chat are at `/dating`, with account settings at `/dashboard`.

`npm ci && npm run build` builds the app. Keep existing Supabase environment variables configured on Vercel. The matching schema is recorded in `scripts/setup-matching.sql`; it is service-only and all mutations require a verified server-side session. No browser receives the service-role key.
