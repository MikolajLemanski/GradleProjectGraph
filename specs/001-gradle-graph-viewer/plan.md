# Implementation Plan: Two-Page Gradle Graph Viewer

**Branch**: `001-gradle-graph-viewer` | **Date**: 2026-02-19 | **Spec**: `/specs/001-gradle-graph-viewer/spec.md`
**Input**: Feature specification from `/specs/001-gradle-graph-viewer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a static two-page web application hosted on GitHub Pages where users input
a GitHub repository URL, the app validates and analyzes Gradle files directly via
GitHub REST API from the browser, and the second page renders only project-level
dependencies as a Mermaid graph with explicit handling for invalid inputs and
external failure states.

## Technical Context

**Language/Version**: JavaScript (ES2020+) running in modern browsers  
**Primary Dependencies**: Mermaid.js (graph rendering), GitHub REST API (public repository metadata/contents)  
**Storage**: N/A (in-browser transient state only; no persistence)  
**Testing**: Browser-based manual acceptance tests + parser unit checks via lightweight JS test runner  
**Target Platform**: Static hosting on GitHub Pages; latest Chrome, Firefox, Safari, and Edge (desktop/mobile)  
**Project Type**: Static web application (frontend-only)  
**Performance Goals**: Validate URL feedback in <300ms perceived latency; render graph within 2s for repositories up to 100 Gradle projects  
**Constraints**: No backend services; use only public GitHub REST endpoints; exclude non-project dependencies from output; deterministic graph for identical source  
**Scale/Scope**: Single-user interactive analysis session; one repository analyzed per run; typical mono-repo Gradle layouts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Two-page journey preserved: input page + graph result page only
- [x] Data source constraints preserved: public GitHub repositories + Gradle
  files (`build.gradle` / `build.gradle.kts`)
- [x] Deterministic graph computation guaranteed for identical inputs
- [x] Validation and failure states specified (invalid URL, missing Gradle file,
  network/rate-limit/API errors)
- [x] Architecture remains static/minimal, or complexity is justified below

**Post-Phase 1 Re-check**: PASS — research decisions, data model, contract,
and quickstart artifacts preserve all constitutional requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-gradle-graph-viewer/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
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
```

**Structure Decision**: Keep a frontend-only static structure in repository
root using dedicated JS modules for page control, GitHub API access, and Gradle
dependency parsing; no backend directories are introduced to preserve minimal
architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
