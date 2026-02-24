---
description: "Tasks for Add GitHub token input feature"
---

# Tasks: Add GitHub token input

**Input**: Design documents from `specs/001-add-github-token/`

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create or update feature plan at specs/001-add-github-token/plan.md
- [ ] T002 Add token input UI to index.html (`index.html`)
- [ ] T003 [P] Add session token getters/setters and storage in js/github-client.js (`js/github-client.js`)
- [ ] T004 [P] Wire token controls (Set / Remove) and status messaging in js/input-page.js (`js/input-page.js`)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T005 Implement Authorization header injection for authenticated requests in js/github-client.js (`js/github-client.js`)
- [ ] T006 Implement token validation helper using `GET /user` in js/github-client.js (`js/github-client.js`)
- [ ] T007 [P] Add error handling and user-visible messages for 401/403 and rate-limit responses in js/input-page.js and js/github-client.js (`js/input-page.js`, `js/github-client.js`)
- [ ] T008 [P] Add data-model and documentation files: specs/001-add-github-token/data-model.md and specs/001-add-github-token/research.md (validate they exist)
- [ ] T009 Ensure tokens are never persisted to disk or analytics: audit code and documentation (`js/github-client.js`, `js/input-page.js`, specs/001-add-github-token/research.md`)

---

## Phase 3: User Story 1 - Authenticate with Personal Access Token (Priority: P1)

**Goal**: Allow users to provide a GitHub Personal Access Token (PAT), validate it, use it for authenticated API calls to list private repositories and fetch repository contents, and allow removal of the token during the session.

**Independent Test**: With a valid PAT, the user can list private repositories and run analysis that produces a rendered graph; invalid/expired tokens surface clear error messages; removing the token reverts to unauthenticated behavior.

- [ ] T010 [US1] Add the token input field and controls to the repository input page (`index.html`)
- [ ] T011 [US1] Implement Set/Remove token handlers and status updates in js/input-page.js (`js/input-page.js`)
- [ ] T012 [US1] Ensure analyze flow uses the session token for authenticated requests (js/github-client.js `analyzeRepository` / `fetchWithRateLimit`) (`js/github-client.js`)
- [ ] T013 [US1] Implement token validation feedback and actionable error messages in `js/input-page.js` (`js/input-page.js`)
- [ ] T014 [P] [US1] Add integration test that mocks GitHub responses to validate: valid token returns private repo listing and successful analysis; invalid token shows error (`tests/integration/authenticated-repo.test.js`)
- [ ] T015 [US1] Prevent token leakage: remove any debug logs that could expose token and add redaction if necessary (`js/github-client.js`, `js/input-page.js`)

---

## Phase 4: User Story 2 - Improve API quota behavior (Priority: P2)

**Goal**: Use supplied PAT to reduce rate-limit failures for users running repeated analyses.

**Independent Test**: Compare mocked rate-limit responses with and without token to demonstrate improved success rate when authenticated.

- [ ] T016 [US2] Surface rate-limit status and guidance in the UI (input loading area or token status) (`index.html`, `js/input-page.js`)
- [ ] T017 [P] [US2] Adjust fetch retry/backoff behavior when authenticated vs anonymous in js/github-client.js (`js/github-client.js`)
- [ ] T018 [P] [US2] Add integration test simulating repeated requests to assert fewer rate-limit failures when token is present (`tests/integration/rate-limit.test.js`)

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T019 [P] Update quickstart and plan docs to include token usage and security notes (`specs/001-add-github-token/quickstart.md`, `specs/001-add-github-token/plan.md`)
- [ ] T020 [P] Add test orchestration entries for new integration tests (`tests/integration/`)
- [ ] T021 Security review: confirm tokens are session-only and not recorded in analytics or logs (audit `js/` files and CI scripts)
- [ ] T022 Accessibility: ensure token input is labeled and accessible (`index.html`)

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: Start here. UI and client helpers can be implemented in parallel (T003, T004 are [P]).
- **Phase 2 (Foundational)**: Blocks all user stories — must be completed before Phase 3.
- **User Stories (Phase 3+)**: Implement in priority order (US1 → US2) or in parallel once foundational tasks complete.

## Parallel Execution Examples

- While one developer implements `js/github-client.js` token helpers (T003/T005/T006), another can implement the UI updates in `index.html` and `js/input-page.js` (T002/T004/T011). These are parallelizable and isolated.
- Integration tests (T014, T018) can be written in parallel with implementation work (mark [P]) and used as validation targets.

## Independent Test Criteria (by Story)

- **US1**: Given a valid PAT, the app lists private repos and completes analysis producing a rendered graph; invalid token returns clear message; removing token reverts to unauthenticated behavior. (See `tests/integration/authenticated-repo.test.js`)
- **US2**: With repeated mocked requests, authenticated requests using the PAT show fewer rate-limit errors than anonymous requests; tests in `tests/integration/rate-limit.test.js` demonstrate behavior.

## Suggested MVP Scope

- MVP: Implement Phase 1 + Phase 2 and complete **User Story 1 (US1)** only (T010–T015). This delivers private repo access, token UX, and validation — sufficient for a demo.

## Format Validation Checklist

- All tasks above strictly follow checklist format: `- [ ] T### [P?] [US?] Description with file path`.

End of file
