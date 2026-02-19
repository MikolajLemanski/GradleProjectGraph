# Data Model — Two-Page Gradle Graph Viewer

## Entity: RepositoryInput
- Purpose: User-provided source descriptor used to start an analysis run.
- Fields:
  - `rawUrl` (string, required)
  - `normalizedOwner` (string, required after validation)
  - `normalizedRepo` (string, required after validation)
  - `normalizedRef` (string, optional; derived from URL `tree/<ref>` when present)
- Validation rules:
  - `rawUrl` must be a valid HTTPS GitHub repository URL.
  - `normalizedOwner` and `normalizedRepo` must be non-empty and URL-safe.
  - Repository must be publicly accessible.

## Entity: ValidationResult
- Purpose: Typed validation status with user-facing messaging.
- Fields:
  - `isValid` (boolean, required)
  - `errorCode` (enum, optional): `invalid_url`, `unsupported_url`, `repo_unavailable`, `network_error`
  - `message` (string, required)
  - `normalizedInput` (RepositoryInput, optional)
- State transition:
  - `Pending` -> `Valid` or `Invalid`.

## Entity: AnalysisRun
- Purpose: Immutable snapshot context for deterministic parsing.
- Fields:
  - `runId` (string, required)
  - `owner` (string, required)
  - `repo` (string, required)
  - `resolvedRef` (string, required; branch/tag/ref used)
  - `commitSha` (string, required; pinned source revision)
  - `startedAt` (datetime, required)
  - `status` (enum, required): `running`, `completed`, `failed`
  - `failureCode` (enum, optional): `missing_gradle_files`, `rate_limited`, `network_error`, `api_error`, `parse_error`
- Validation rules:
  - `commitSha` must remain fixed for all file reads in a run.

## Entity: GradleFile
- Purpose: Input source file inspected for project dependencies.
- Fields:
  - `path` (string, required)
  - `kind` (enum, required): `build_gradle`, `build_gradle_kts`, `settings_gradle`, `settings_gradle_kts`
  - `content` (string, required)
- Validation rules:
  - Only files ending in `build.gradle`, `build.gradle.kts`, `settings.gradle`, `settings.gradle.kts` are in scope.

## Entity: ProjectNode
- Purpose: Canonical Gradle project/module shown in the graph.
- Fields:
  - `projectPath` (string, required; canonical `:module[:submodule]`)
  - `displayName` (string, required)
- Validation rules:
  - `projectPath` must begin with `:` and be unique within one graph result.

## Entity: ProjectDependencyEdge
- Purpose: Directed relation between two project nodes.
- Fields:
  - `fromProjectPath` (string, required)
  - `toProjectPath` (string, required)
  - `sourceFilePath` (string, required)
- Validation rules:
  - `fromProjectPath != toProjectPath` for direct self-loop rejection unless explicitly present in source.
  - Duplicate edges are collapsed by `(fromProjectPath, toProjectPath)`.

## Entity: GraphResult
- Purpose: Deterministic output rendered on page 2.
- Fields:
  - `repository` (RepositoryInput, required)
  - `commitSha` (string, required)
  - `nodes` (ProjectNode[], required)
  - `edges` (ProjectDependencyEdge[], required)
  - `warnings` (string[], optional)
  - `mermaidDefinition` (string, required)
- Validation rules:
  - Nodes sorted lexicographically by `projectPath`.
  - Edges sorted lexicographically by `fromProjectPath`, then `toProjectPath`.
  - `mermaidDefinition` generated from sorted nodes and edges only.

## Relationships
- `RepositoryInput` 1 -> 1 `ValidationResult`
- `RepositoryInput` 1 -> many `AnalysisRun` (over time)
- `AnalysisRun` 1 -> many `GradleFile`
- `GraphResult` aggregates many `ProjectNode` and many `ProjectDependencyEdge`
- `ProjectDependencyEdge` references two `ProjectNode` entities

## Primary State Transitions
1. Input lifecycle: `raw` -> `normalized` -> `validated`
2. Analysis lifecycle: `running` -> `completed` | `failed`
3. Graph lifecycle: `parsed` -> `canonicalized` -> `rendered`
