# Quickstart — Two-Page Gradle Graph Viewer

## Prerequisites
- Modern browser (Chrome, Firefox, Safari, or Edge)
- Internet access to `api.github.com`
- Local static file server (for development)

## Run Locally
1. Start a static server at repository root (example: `python3 -m http.server 8080`).
2. Open `http://localhost:8080` in a browser.
3. On page 1, paste a public GitHub repository URL.
4. Submit and wait for analysis.
5. On page 2, verify a Mermaid graph is displayed.

## Primary User Flow
1. Enter valid public GitHub repo URL.
2. App validates and normalizes repository identity.
3. App resolves repository/ref to commit SHA.
4. App fetches repository tree and Gradle files.
5. App parses only project dependencies.
6. App generates deterministic Mermaid definition.
7. App renders graph result page.

## Validation Scenarios
- Invalid URL format blocks submission with correction message.
- Non-GitHub URL blocks submission with guidance.
- Private/inaccessible repository shows actionable error.
- Missing `build.gradle` and `build.gradle.kts` shows explicit unsupported/missing-file message.
- API rate-limit/network failure shows retry guidance.

## Determinism Check
1. Run analysis for the same repository twice without source changes.
2. Confirm node set and edge set are identical.
3. Confirm Mermaid definition text is identical.

## Scope Guardrails
- Include only project-to-project dependencies.
- Exclude Maven/external package dependencies from graph output.
- Keep exactly two user-facing pages.
