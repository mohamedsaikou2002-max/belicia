# Architecture rules

- Pages are public (no sign-in gate) because the owner wants anyone to use the app.
- Keep the brand entry page public at / and the existing orb workspace at /chat so visitors can enter before signing in.
- Derive edge-function ownership from a verified bearer token, never client-supplied identity; scope database operations to that owner to isolate accounts.
- Use authFetch for manual Cloud requests and the generated client for standard calls so every feature attaches the current session.
- Namespace browser session and simulation storage by authenticated user and clear in-memory caches on sign-out so switching accounts cannot reveal another account's work.