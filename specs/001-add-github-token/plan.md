# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a session-scoped GitHub Personal Access Token (PAT) input to the repository input page so users can authenticate requests to GitHub. When present, the token will be used for listing repositories and fetching repository contents to enable private-repo analysis and reduce rate-limit failures. The implementation is client-only (plain JS/HTML/CSS), stores the token in memory for the current session, and exposes a clear UI to add, indicate, and remove the token.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Plain JavaScript (ECMAScript 2020+), HTML5, CSS3
**Primary Dependencies**: None (vanilla JS). Uses existing `js/github-client.js` and `js/input-page.js` extension points.
**Storage**: Session memory (in-memory JS object). No persistence to disk or server by default; optional `sessionStorage` use is possible but currently disabled per spec.
**Testing**: Existing JavaScript tests under `tests/integration` (Mocha/Jest style). New unit/integration tests to cover token UI behavior and authenticated requests.
**Target Platform**: Modern desktop and mobile web browsers (Chrome, Firefox, Safari).
**Project Type**: Single-page/static web app (client-only)
**Performance Goals**: Minimal overhead; token storage and usage must not add measurable latency to API calls beyond auth headers.
**Constraints**: Token must never be written to logs, network payloads other than Authorization header, or analytics. Token usage must be removable at runtime and revert to unauthenticated requests immediately.
**Scale/Scope**: Small feature scoped to client UI and request headers; no backend changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Two-page journey preserved: input page + graph result page only
- [x] Data source constraints preserved: public GitHub repositories + Gradle
  files (`build.gradle` / `build.gradle.kts`)
- [x] Deterministic graph computation guaranteed for identical inputs
- [x] Validation and failure states specified (invalid URL, missing Gradle file,
  network/rate-limit/API errors)
- [x] Architecture remains static/minimal, or complexity is justified below

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Static web app (DEFAULT)
index.html
style.css
js/
├── input-page.js
├── graph-page.js
├── github-client.js
└── gradle-parser.js

tests/
├── integration/
└── parser/

# [REMOVE IF UNUSED] Option 2: Split web app (frontend + backend when needed)
backend/
├── src/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── pages/
│   ├── components/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Use the existing static web app layout at repository root (index.html, style.css, js/). Implement token UI in `index.html` and `js/input-page.js` and add helper functions in `js/github-client.js` to accept optional token for authenticated requests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
