# Belicia

Belicia is a React/TypeScript and Supabase-powered AI intelligence workspace. It includes voice-first chat, Islamic Golden Age-inspired research, game-theoretic exploration, Pod Room, daily briefs, and account settings.

## What changed

- Public marketing page at `/` for guests, and at `/landing` for everyone. Signed-in visitors to `/` continue directly to the existing chat.
- Protected chat alias `/app` and all original protected feature routes remain available.
- Existing email/password, Google and Lovable sign-in flows and password recovery are preserved.
- The chat and memory Edge Functions validate the Supabase access token and use the authenticated user ID instead of an untrusted `userId` or `user_id` request value.
- An RLS migration restricts direct access to `belicia_memory` and `belicia_profile` rows to each logged-in account.

## Local development

Requires Node.js 20+ and npm.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and populate your Supabase project URL and its **public publishable key**.
3. In Supabase Authentication, enable Email and Google providers. Configure Google Cloud's authorized redirect URI to `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`. Enable Lovable authentication if using the Lovable sign-in button.
4. In **Authentication → URL Configuration**, include local and production return URLs, such as `http://localhost:8080/**` and `https://YOUR_DOMAIN/**`.
5. Start locally with `npm run dev` (Vite uses port 8080).

Never commit service-role keys or Google client secrets, and never put them in any `VITE_` variable.

## Deployment order

1. Apply `supabase/migrations/20261101000000_scope_account_memory_profile.sql` to the correct Supabase project, e.g. with `supabase db push` or the SQL Editor.
2. Deploy `supabase/functions/chat` and `supabase/functions/memory` **together**, including `supabase/functions/_shared/auth.ts`.
3. Deploy the React application.
4. Verify login, logout, Google account creation, password recovery, chat save/restore, and that Account A cannot read, change, or delete Account B's chat/profile data.

The two hardened functions accept bearer JWTs; their shared helper verifies tokens via Supabase Auth. They also require their normal server-side Supabase environment variables. There is **no need** to expose a service-role key to the browser.

**Important:** Pre-existing `user_id = 'default'` history is deliberately not attached to new accounts. Other services/tables (including hardware, device ingestion, game simulations, and scheduled briefs) require separate access-control review before you can describe the *entire* Belicia backend as tenant-isolated. This PR alone does not change a live Supabase database or deploy Edge Functions.

## Commands

- `npm run dev` – development
- `npm run build` – compile/build
- `npm run lint` – static analysis
- `npm test` – tests
