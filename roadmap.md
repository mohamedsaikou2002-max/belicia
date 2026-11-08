# Belicia MKII — Phase 1–3 Roadmap (Accounts + Security)

Decisions: email/password only; no signup verification; legacy "default" data quarantined.

- [x] Enable email/password auth
- [x] Enable Google + Lovable social sign-in
- [ ] DB migration: ownership-scoped RLS on all 7 tables, profiles table + signup trigger, quarantine legacy rows
- [ ] Frontend: AuthContext, /auth, /reset-password, ProtectedRoute, sign-out
- [ ] Update pages to use real auth user id instead of "default"
- [ ] Secure edge functions: verify token server-side, derive user from token (chat, memory, tts, pod-room, game-theory, eagle-eye, intel-distill, intel-archive)
- [ ] Verify: build clean, signup/login flow works, cross-user isolation holds
- [ ] Finish hosted signup/provider configuration and verify profile creation — blocked by paused Lovable Cloud.

- [x] Apply the current landing page from mohamedsaikou2002-max/belicia while preserving protected workspace routes — page, routing, orb, and styles match GitHub exactly.
- [x] Remove Google and Lovable buttons; offer email/password signup and sign-in only.
- [ ] Disable hosted Google/Lovable providers, enable instant signup, and verify account creation — settings rejected because Lovable Cloud is paused.
