# Phase 0 Research — Two-Page Gradle Graph Viewer

## Decision 1: GitHub URL validation and normalization
Decision: Accept only canonical GitHub repository URLs and normalize to `{owner, repo, optionalRef}`. Supported forms include `https://github.com/<owner>/<repo>`, optional trailing slash, optional `.git`, and optional `/tree/<ref>`.
Rationale: Strict normalization provides deterministic repository identity and avoids ambiguous parsing paths.
Alternatives considered: Accept any GitHub-looking URL (too permissive); require `owner/repo` text only (less user-friendly).

## Decision 2: Repository discovery and retrieval pattern
Decision: Use GitHub REST API with a pinned commit snapshot: resolve repository and ref to commit SHA, list file tree recursively, then fetch only matching Gradle files at that SHA.
Rationale: A single pinned SHA ensures deterministic reads from one repository state while minimizing API calls.
Alternatives considered: Recursive `contents` traversal (higher call count and directory limits); repository archive download (larger transfer, less incremental control).

## Decision 3: API endpoints sequence
Decision: Use this sequence per analysis run: `GET /repos/{owner}/{repo}` → resolve ref/default branch to commit SHA → `GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1` → fetch each matched `build.gradle` / `build.gradle.kts` with `ref=<sha>`.
Rationale: This sequence is compatible with public repositories, supports monorepos, and keeps all parsing inputs immutable for the run.
Alternatives considered: GitHub GraphQL for equivalent data (additional complexity); code search API for file discovery (less predictable coverage).

## Decision 4: Gradle project-dependency parsing strategy
Decision: Implement conservative static extraction focused only on project dependencies in Groovy and Kotlin DSL: `project(":module")`, `project(path: ":module")`, and `projects.foo[.bar]`-style references.
Rationale: Full Gradle execution/parsing is out of scope for browser-only static hosting; constrained extraction matches feature requirements safely.
Alternatives considered: Full AST/grammar parser (heavier and slower to maintain); broad regex-only extraction for all dependency formats (too many false positives).

## Decision 5: Exclusion rules for non-project dependencies
Decision: Explicitly ignore external package coordinates and unresolved dynamic dependency expressions, and surface warning text for unsupported patterns.
Rationale: The feature explicitly requires project-only graph edges and exclusion of Maven-style dependencies.
Alternatives considered: Heuristic inference for dynamic expressions (non-deterministic); silent omission without warnings (poor transparency).

## Decision 6: Deterministic graph generation
Decision: Canonicalize all project paths to leading-colon format, deduplicate edges by `(from,to)`, and lexicographically sort files, nodes, and edges before Mermaid generation.
Rationale: Stable canonicalization and ordering guarantee reproducible output for unchanged inputs.
Alternatives considered: Preserve API discovery order (can vary); deduplicate only during rendering (harder to validate correctness).

## Decision 7: Mermaid rendering conventions
Decision: Render graph using `flowchart LR` with stable node IDs derived from canonical project paths, escaped labels, and duplicate-edge collapse.
Rationale: Left-to-right flow improves readability, while stable IDs and escaped labels prevent rendering variance and syntax issues.
Alternatives considered: Rich styling and animations (adds complexity without core value); always using grouped subgraphs (hurts small-graph readability).

## Decision 8: Failure-state UX in browser-only architecture
Decision: Classify and surface errors as `invalid_url`, `repo_unavailable`, `missing_gradle_files`, `rate_limited`, `network_error`, and `parse_warning`; include actionable next steps for each.
Rationale: Clear, typed failures satisfy constitution requirements for predictable behavior when external systems fail.
Alternatives considered: Single generic error state (insufficient guidance); unlimited automatic retries (can worsen rate-limit behavior).
