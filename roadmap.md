# Belicia MKII — Phase 1–3 Roadmap (Accounts + Security)

Decisions: email/password + Google + Lovable sign-in; email confirmation required; legacy "default" data quarantined.

- [x] Enable email/password auth
- [x] Enable Google + Lovable social sign-in
- [ ] DB migration: ownership-scoped RLS on all 7 tables, profiles table + signup trigger, quarantine legacy rows
- [ ] Frontend: AuthContext, /auth, /reset-password, ProtectedRoute, sign-out
- [ ] Update pages to use real auth user id instead of "default"
- [ ] Secure edge functions: verify token server-side, derive user from token (chat, memory, tts, pod-room, game-theory, eagle-eye, intel-distill, intel-archive)
- [ ] Verify: build clean, signup/login flow works, cross-user isolation holds
