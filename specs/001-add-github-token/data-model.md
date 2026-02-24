# Data Model

Entities introduced or affected by this feature:

- Personal Access Token (PAT)
  - description: Short opaque token supplied by user to authenticate GitHub API requests for the current browser session.
  - fields:
    - `value` (string) — the token string, stored only in-memory for session; never persisted.
    - `scopes` (array[string]) — external attribute inferred from GitHub API responses (e.g., `repo`, `public_repo`).
    - `validatedAt` (timestamp) — when the token was last validated in-session.
  - validation rules:
    - non-empty string when provided
    - validation via a lightweight `/user` or `/rate_limit` API call

- Auth Session
  - description: ephemeral association of a PAT with the current browser session.
  - fields:
    - `isAuthenticated` (boolean)
    - `username` (string|null)
    - `tokenPresent` (boolean)

- Repository (existing model)
  - no persistent changes; repository metadata may include `private` flag which informs UI messaging and access behavior.

State transitions:
- Token lifecycle: `unset` → `set (pending validation)` → `validated` OR `invalid` → `removed`
