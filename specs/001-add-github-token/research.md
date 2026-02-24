# research.md# research.md

























- Validate UI displays for 401/403/network errors with mocked responses.- Add integration tests validating that when a token is set, repository listing returns private repos (mocked), and when cleared, private repos are not listed.Notes for tests:- Prompt user to create a limited-scope token automatically: out of scope for this client-side feature.- Server-side token exchange / OAuth flow: rejected for scope and complexity; would require backend and user OAuth app registration.- Persist token in `localStorage` / `indexedDB`: rejected due to persistent storage risk and spec decision to treat tokens as session-only.Alternatives considered:- Removal: provide a UI control to clear the in-memory token immediately; subsequent requests must be unauthenticated.- Privacy: never expose the token in UI logs, error details, or analytics payloads. When logging exceptions for debugging, redact the token.  - Network / API unreachable → show "Network or GitHub API error; try again later."  - 403 Forbidden with insufficient scopes (API message indicates insufficient permissions) → show "Token missing required scopes (repo). Recreate token with 'repo' scope."  - 403 Forbidden with message indicating rate-limit → show rate-limit guidance and suggest adding a token or waiting.  - 401 Unauthorized → show "Invalid or expired token. Please re-enter a valid Personal Access Token."- Error detection and messages:- Required scopes: to access private repositories and repository contents, recommend `repo` scope. For read-only access to repo contents, `repo` covers necessary permissions. Document scope guidance in the UI.- Token transmission: send as an HTTP `Authorization` header. Use the `token <PAT>` scheme (widely supported for GitHub PATs). Example: `Authorization: token OAUTH_TOKEN`.Key implementation details:Rationale: The project is a static, client-only web app. Storing tokens server-side or persisting them locally increases attack surface and is outside the project's current scope. Keeping tokens in-memory reduces persistence risk while enabling authenticated API requests to list private repositories and fetch repository contents.Decision: Use a session-scoped GitHub Personal Access Token (PAT) entered by the user in the client UI and stored only in-memory for the current browser session.
Decision: Store token in session memory and use it only for Authorization headers

Rationale: The feature spec mandates session-only tokens to minimize attack surface. A client-only implementation avoids backend changes and keeps the UX simple.

Authentication header:
- Decision: Use `Authorization: token <PAT>` for requests when a PAT is present.
- Rationale: This is a widely supported pattern for GitHub PATs and is simple to implement in fetch/XHR calls.

Token validation strategy:
- Decision: Validate tokens by attempting a lightweight authenticated request such as `GET https://api.github.com/user` or `GET https://api.github.com/rate_limit` and handling 401/403 responses.
- Rationale: These endpoints are quick, return clear error codes for invalid/expired tokens, and do not enumerate repositories by default.

Error messages and scopes:
- Decision: On 401/403 show an actionable message: "Invalid or expired token — re-enter a valid GitHub Personal Access Token with `repo` scope to access private repositories." If a repository fetch returns 403 when listing private repos, show a message indicating insufficient scopes.

Security constraints:
- Never write the token to console logs, analytics, or include it in error messages. Only send via `Authorization` header to GitHub API.
- When the user removes the token, immediately clear it from memory and stop sending it on subsequent requests.

Alternatives considered:
- Persisting token to `localStorage` or server-side storage — rejected because the spec requires session-only behavior.
- Using OAuth flow — rejected due to scope and backend requirements; out of scope for this client-only change.
