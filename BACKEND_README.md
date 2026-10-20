# Belicia Backend Export

Exported from [mohamedsaikou2002-max/belicia](https://github.com/mohamedsaikou2002-max/belicia) on 2026-10-20.

Source branch: `main`
Source commit: `c8928f5d4a4db5b04dc1c65a8332f288dd95ff31`

This archive contains the Belicia backend source code:
- `supabase/functions/` — Deno/TypeScript Supabase Edge Functions (chat, memory, TTS, MiroFish, game theory, intel features, home bridge, PEMF telemetry).
- `supabase/migrations/` — SQL database schema migrations.
- `supabase/config.toml` — Supabase project function configuration.
- `scripts/` — Python home-node service scripts and sample environment configuration.
- `src/integrations/supabase/types.ts` — generated database types shared with clients.
- `src/lib/mass_psych_corpus.js` — shared simulation corpus; originally used by frontend code.

## Setup

**Supabase**: Use Supabase CLI to link your target project, then apply the reviewed migrations and deploy the required functions. Verify any JWT/auth settings before publishing endpoints.

**Python home node**: Review `scripts/README.md`, install its listed Python dependencies, then copy `scripts/.env.example` to `scripts/.env` locally and configure your own values.

## Important security note

The exported `supabase/config.toml` has `verify_jwt = false` for multiple functions. Review access controls and add authentication/authorization where needed before exposing these endpoints to the internet.

**No credentials are included**. The repository's `.env` file has deliberately been excluded. Never commit real service-role keys, secret tokens, or device keys.

This export is source code, not a deployed database snapshot or a packaged executable.
