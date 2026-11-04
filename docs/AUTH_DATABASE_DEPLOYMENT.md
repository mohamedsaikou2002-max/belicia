# Belicia auth + database production handoff

This repository uses **one Supabase Auth project and its associated PostgreSQL
database**. The account UI and authenticated Edge Functions already exist.
Do not create a second auth tenant, and never put a service-role key in a Vite
`VITE_*` variable or Git repository.

## Observed on 2026-11-04

- Lovable project: `ef32e092-be5d-4c78-a969-369b16ce592e`.
- GitHub source: `mohamedsaikou2002-max/belicia`, synchronized to Lovable at
  commit `6bf02f60e3ee3304ab2f3645ca9dfd016f3e48ce` before this change.
- Lovable reported `database enabled: true`, stack `supabase`.
- Two read-only cloud DB API checks (`SELECT 1` and `information_schema`)
  both returned HTTP 400: **"Database is possibly not accessible at the moment"**.
  Therefore the actual connection and applied policies are **NOT verified**.
- Lovable rejected a build message because the workspace has **no credits**.
  GitHub changes do not fix workspace billing or prove a live deployment.

## Finish deployment after restoring access

1. Restore Lovable workspace credits:
   https://lovable.dev/settings/billing
2. Open the existing project:
   https://lovable.dev/projects/ef32e092-be5d-4c78-a969-369b16ce592e
   Check Cloud / Database health and that the Supabase Auth project is the
   same project used by `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_PUBLISHABLE_KEY`. If the dashboard still cannot run
   `SELECT 1 AS ok`, fix the Cloud database connection before proceeding.
   Project ID recorded in `supabase/config.toml`: `focrrskgrxdkiddajxuq`.
   Confirm this identifier against the connected database; do not blindly
   replace a working project or user database.
3. Review and apply the **new** migration
   `supabase/migrations/20261104073000_belicia_account_isolation.sql`
   against the actual Supabase PostgreSQL DB with migration tooling or the
   authorized SQL editor. Check backups before changes. This migration adds
   automatic `profiles` and `belicia_profile` rows for new identities,
   backfills missing rows, and replaces known unsafe anonymous / open policies
   with account-ownership policies. Existing `user_id = 'default'` records
   remain intact but are inaccessible to normal accounts.
4. Verify current tables, columns and policies with read-only SQL:

   ```sql
   SELECT 1 AS ok;
   SELECT tablename, policyname, roles, cmd, qual, with_check
   FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename = ANY(ARRAY[
       'profiles', 'belicia_profile', 'belicia_memory', 'eagle_eye_targets',
       'home_commands', 'mirofish_sims', 'pemf_readings', 'scheduled_briefs'
     ])
   ORDER BY tablename, policyname;
   SELECT table_name, column_name, data_type
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'belicia_profile'
   ORDER BY ordinal_position;
   ```

   Expected: all eight tables have RLS enabled and only authenticated
   owner-scoped policies for customer access; no old `public read ...` or
   `open read ...` permissive policies. Verify grants for the anonymous role.
   The service-role backend must still filter by verified `auth.uid()`
   explicitly (it bypasses RLS).

5. In Supabase Auth settings, configure the **Site URL**, allowed redirect
   URLs for the published Belicia domain and Lovable preview origin, and the
   correct email confirmation / password recovery templates. Enable Google
   and/or Lovable OAuth providers in their respective dashboards and
   configure their callback URLs and credentials there, not in the repo.
   Email login itself should remain usable when OAuth is not configured.
6. Rebuild in Lovable and confirm its new code commit matches the GitHub
   source. Publish only after the build and account-isolation checks pass.

## Acceptance tests (require a working live backend)

- Create **account A** by email and confirm it; sign in and reload.
- Save A's display name and active missions on `/profile`; reload and verify
  values persisted in `belicia_profile`.
- Sign out; confirm `/profile`, `/chat`, `/pod-room`, and `/eagle-eye`
  redirect to `/auth`, while `/`, `/auth`, `/reset-password` remain public.
- Create **account B**, and verify B cannot read/update A's rows in
  `belicia_profile`, `belicia_memory` or `eagle_eye_targets`. Verify that
  A's cached UI data never appears when switching to B in the same browser.
- Test password recovery email, valid link, expired link, and a successful
  new-password sign-in; do not use real account credentials in logs.
- Test Google/Lovable OAuth only for providers actually enabled in dashboard;
  verify origin return and new-session persistence after redirect.
- From anonymous client context, direct `SELECT` on protected tables should
  fail or return no rows; an authenticated cross-owner insert/update must fail.
- Confirm Edge Functions reject requests with no bearer token and cannot use
  a caller-provided `user_id` to access another account.
- Run `npm ci && npm run build && npm test` from a checked-out repository
  before merging and deploying.

**Important:** The GitHub migration being present or a passing frontend build
does not mean the live DB migration is applied. Do not mark production auth or
database connectivity complete until the live verification above succeeds.
