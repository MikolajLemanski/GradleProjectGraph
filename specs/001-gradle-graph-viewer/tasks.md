# Tasks: Two-Page Gradle Graph Viewer

**Input**: Design documents from `/specs/001-gradle-graph-viewer/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/github-analysis.openapi.yaml, quickstart.md

**Tests**: No explicit TDD/test-first requirement was specified in the feature specification, so implementation tasks are listed without mandatory test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize static app structure and two-page shell.

- [ ] T001 Create JavaScript module directory structure in js/ and tests/ with placeholder files in js/input-page.js, js/graph-page.js, js/github-client.js, and js/gradle-parser.js
- [ ] T002 Update static two-page HTML shell with input and graph sections in index.html
- [ ] T003 [P] Add base modern layout and shared design tokens for both pages in style.css
- [ ] T004 [P] Add Mermaid.js script loading and bootstrap hook in index.html

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core analysis infrastructure required before implementing user stories.

**⚠️ CRITICAL**: Complete this phase before starting user stories.

- [ ] T005 Implement repository URL normalization/parsing utility in js/input-page.js
- [ ] T006 [P] Implement GitHub repository metadata and branch/ref resolution client functions in js/github-client.js
- [ ] T007 [P] Implement recursive tree fetch and Gradle file discovery functions in js/github-client.js
- [ ] T008 Implement pinned-SHA file content fetch and decode flow in js/github-client.js
- [ ] T009 [P] Implement Gradle project dependency extraction for Groovy/Kotlin patterns in js/gradle-parser.js
- [ ] T010 Implement graph canonicalization and deterministic sort/dedup functions in js/gradle-parser.js
- [ ] T011 Implement Mermaid definition generator for project-only graph output in js/graph-page.js
- [ ] T012 Implement shared error-code mapping and user message formatting in js/input-page.js

**Checkpoint**: Foundation ready — user story implementation can proceed.

---

## Phase 3: User Story 1 - Analyze Repository and View Graph (Priority: P1) 🎯 MVP

**Goal**: Deliver end-to-end flow from valid repository input to rendered project dependency graph.

**Independent Test**: Submit a valid public Gradle repository URL and verify page transition plus project-only Mermaid graph output.

### Implementation for User Story 1

- [ ] T013 [US1] Wire analyze action from input submit to analysis pipeline in js/input-page.js
- [ ] T014 [US1] Implement orchestrated GitHub fetch sequence (repo -> ref -> tree -> files) in js/github-client.js
- [ ] T015 [US1] Build project node/edge graph result assembly from parsed files in js/gradle-parser.js
- [ ] T016 [US1] Render graph page state, legend, and Mermaid output in js/graph-page.js
- [ ] T017 [US1] Implement page transition state management between input and graph sections in js/input-page.js
- [ ] T018 [US1] Exclude Maven/external dependencies and surface parse warnings in js/gradle-parser.js

**Checkpoint**: User Story 1 is independently functional and demo-ready as MVP.

---

## Phase 4: User Story 2 - Validate Repository Input (Priority: P2)

**Goal**: Provide immediate, actionable URL validation and clear failure handling for inaccessible repositories.

**Independent Test**: Validate malformed URLs, non-GitHub URLs, and private/unavailable repositories without entering graph page.

### Implementation for User Story 2

- [ ] T019 [US2] Implement client-side URL format checks and non-GitHub rejection on submit in js/input-page.js
- [ ] T020 [US2] Add inline validation UI states and corrective helper text on input page in index.html
- [ ] T021 [US2] Style validation statuses (error, warning, success, loading) for input workflow in style.css
- [ ] T022 [US2] Implement repository availability validation using GitHub metadata endpoint in js/github-client.js
- [ ] T023 [US2] Implement failure-state handling for rate-limit, network, and missing-repository responses in js/input-page.js
- [ ] T024 [US2] Prevent graph-page transition on invalid or failed validation states in js/input-page.js

**Checkpoint**: User Story 2 is independently testable and prevents invalid analysis attempts.

---

## Phase 5: User Story 3 - Understand Results in a Modern UI (Priority: P3)

**Goal**: Ensure polished modern UX and responsive readability across both pages.

**Independent Test**: Run desktop/mobile viewport checks and confirm users can complete full flow without instructions.

### Implementation for User Story 3

- [ ] T025 [US3] Implement modern visual hierarchy and spacing system for both pages in style.css
- [ ] T026 [US3] Improve graph readability with node/legend container presentation in style.css
- [ ] T027 [US3] Add responsive layout breakpoints for mobile and desktop in style.css
- [ ] T028 [US3] Add empty/loading/error/success visual states for graph area in index.html
- [ ] T029 [US3] Implement graph-page status messaging and progressive rendering feedback in js/graph-page.js

**Checkpoint**: User Story 3 is independently functional with improved usability and visual quality.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across all user stories.

- [ ] T030 [P] Add usage and limitation notes for public GitHub/rate-limit behavior in README.md
- [ ] T031 Run quickstart scenario verification and document outcomes in specs/001-gradle-graph-viewer/quickstart.md
- [ ] T032 [P] Refine edge-case messaging copy consistency across input and graph pages in js/input-page.js
- [ ] T033 [P] Refine edge-case messaging copy consistency across input and graph pages in js/graph-page.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2
- **Phase 5 (US3)**: Depends on Phase 2
- **Phase 6 (Polish)**: Depends on completion of desired user stories

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on US2/US3
- **US2 (P2)**: Starts after Foundational; no dependency on US1/US3
- **US3 (P3)**: Starts after Foundational; no dependency on US1/US2

### Story Completion Order

1. **US1 (MVP)**
2. **US2**
3. **US3**

---

## Parallel Execution Examples

### User Story 1

- Run T014 and T015 in parallel after foundational parser/client utilities are stable.
- Run T016 and T017 in parallel (different modules: js/graph-page.js and js/input-page.js).

### User Story 2

- Run T020 and T021 in parallel (index.html and style.css).
- Run T022 and T023 in parallel (js/github-client.js and js/input-page.js).

### User Story 3

- Run T026 and T029 in parallel (style.css and js/graph-page.js).
- Run T027 and T028 in parallel (style.css and index.html).

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate end-to-end two-page graph flow
4. Demo/deploy MVP

### Incremental Delivery

1. Deliver US1 (core analysis + graph)
2. Deliver US2 (validation/failure robustness)
3. Deliver US3 (modern responsive polish)
4. Finish with Phase 6 cross-cutting refinements

### Parallel Team Strategy

1. Team aligns on Setup + Foundational tasks
2. After Phase 2:
   - Developer A: US1
   - Developer B: US2
   - Developer C: US3
3. Integrate with final polish phase
