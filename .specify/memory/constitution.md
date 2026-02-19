<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
	- [PRINCIPLE_1_NAME] -> I. Two-Page Journey Is Fixed
	- [PRINCIPLE_2_NAME] -> II. Public GitHub + Gradle Files Are Source of Truth
	- [PRINCIPLE_3_NAME] -> III. Deterministic Graph Output
	- [PRINCIPLE_4_NAME] -> IV. Clear Validation and Failure States
	- [PRINCIPLE_5_NAME] -> V. Keep It Static and Minimal
- Added sections:
	- Technical Standards
	- Delivery Workflow & Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ✅ reviewed (no update needed): .specify/templates/checklist-template.md
	- ✅ reviewed (no update needed): .specify/templates/agent-file-template.md
	- ✅ reviewed (not present): .specify/templates/commands/*.md
- Follow-up TODOs:
	- None
-->

# GradleProjectGraph Constitution

## Core Principles

### I. Two-Page Journey Is Fixed
The product MUST keep exactly two user-facing pages: (1) repository input and
(2) computed dependency graph result. Changes MAY improve these pages but MUST
NOT introduce additional user flow pages unless this constitution is amended.
Rationale: this product is intentionally minimal and optimized for one core task.

### II. Public GitHub + Gradle Files Are Source of Truth
The system MUST analyze only public GitHub repositories and MUST derive results
from repository Gradle build files (`build.gradle` or `build.gradle.kts`). The
application MUST disclose unsupported repositories or missing Gradle files with
explicit user-facing errors.
Rationale: transparency and predictable behavior depend on verifiable sources.

### III. Deterministic Graph Output
Given identical repository URL, branch/ref, and source contents, dependency
categorization and graph structure MUST be deterministic. Parsing logic changes
MUST include regression checks for known dependency declarations.
Rationale: deterministic output makes results trustworthy and debuggable.

### IV. Clear Validation and Failure States
Repository input MUST be validated before analysis. Failures (invalid URL,
network/API limits, unsupported repository structure, parser failures) MUST be
surfaced in clear language with actionable next steps.
Rationale: this tool depends on external systems and must fail predictably.

### V. Keep It Static and Minimal
Implementation SHOULD prioritize a lightweight static web architecture and avoid
unnecessary infrastructure or multi-service complexity. Added complexity MUST be
explicitly justified in planning artifacts.
Rationale: simple deployment (including GitHub Pages) is a core project goal.

## Technical Standards

- Frontend-first delivery using static assets is the default architecture.
- Input page MUST collect GitHub repository and optional branch/ref.
- Result page MUST display computed dependency graph and dependency categories.
- User-visible behavior MUST remain responsive on modern desktop and mobile
	browsers.
- API/rate-limit constraints from GitHub MUST be acknowledged in UX messaging.

## Delivery Workflow & Quality Gates

- Every specification MUST define independently testable user stories, with the
	P1 story covering full two-page flow from input to rendered graph.
- Every implementation plan MUST pass a Constitution Check that confirms:
	- two-page journey preserved,
	- public GitHub + Gradle source assumptions preserved,
	- deterministic parsing/graph behavior protected,
	- validation and error states explicitly designed,
	- static/minimal architecture maintained or justified.
- Every task list MUST include work items for input validation, parsing logic,
	graph rendering, and failure-state UX.

## Governance

This constitution is the highest-priority project guidance for product and
engineering decisions in this repository.

Amendment process:
- Propose change with rationale and impacted principles/sections.
- Update dependent templates and guidance documents in the same change.
- Record a Sync Impact Report at the top of this constitution.

Versioning policy (semantic versioning):
- MAJOR: incompatible governance changes or principle removals/redefinitions.
- MINOR: new principles/sections or materially expanded requirements.
- PATCH: wording clarifications and non-semantic refinements.

Compliance review expectations:
- Plans, specs, and task lists MUST include explicit constitution alignment.
- Reviews MUST block merges when constitutional requirements are violated.
- Exceptions MUST be documented with time-bound follow-up remediation.

**Version**: 1.0.0 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
