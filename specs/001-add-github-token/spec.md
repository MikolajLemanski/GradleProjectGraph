```markdown
# Feature Specification: Add GitHub token input

**Feature Branch**: `001-add-github-token`
**Created**: 24 lutego 2026
**Status**: Draft
**Input**: User description: "I want add text field for Github token to authenticate user and have more API quota and also so the user can see private repositories"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticate with Personal Access Token (Priority: P1)

A user wants to provide a GitHub Personal Access Token (PAT) so the app can authenticate requests on their behalf, increase API quota, and access private repositories for analysis.

**Why this priority**: This enables private-repo analysis and reduces rate-limit failures for power users, delivering clear user value.

**Independent Test**: Using a valid PAT with appropriate scopes, the user can list their repositories including private ones, start analysis on a private repo, and receive a rendered graph.

**Acceptance Scenarios**:

1. **Given** the user is on the repository input page, **When** they paste a valid PAT into the GitHub token field and submit, **Then** the system lists repositories accessible to that token (including private) and allows analysis of selected repos.
2. **Given** the user provides an invalid or expired token, **When** they submit, **Then** the system shows a clear, actionable error message explaining the failure and how to fix it.
3. **Given** the user removes or revokes the token, **When** they attempt to analyze a previously accessible private repo, **Then** the system prompts for a new token or denies access with a clear message.

---

### User Story 2 - Improve API quota behavior (Priority: P2)

Allow users to optionally supply a token so routine public-repo analyses still work but power users can avoid rate-limit interruptions.

**Why this priority**: Reduces accidental rate-limit failures during analysis and testing.

**Independent Test**: With and without a token, repeated requests demonstrate that authenticated requests succeed more reliably under GitHub rate-limits.

**Acceptance Scenarios**:

1. **Given** high-frequency analysis requests, **When** a user supplies a valid token, **Then** fewer rate-limit errors occur for that user compared to anonymous usage.

---

### Edge Cases

- Invalid token formats or truncated tokens.
- Tokens without necessary scopes (cannot list private repos or read repository contents).
- Revoked or expired tokens mid-session.
- Token accidentally pasted into the public repo input field.
- Network or GitHub API outages while using a token.
- Users misunderstanding token permissions and granting overly-broad scopes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Add a clearly labeled, single-line text field on the repository input page that accepts a GitHub Personal Access Token.
- **FR-002**: The system MUST include an explicit, user-visible way to submit the token and a way to remove/revoke the token from the current session.
- **FR-003**: When a token is present, the system MUST use it to authenticate requests that list repositories and fetch repository contents necessary for analysis.
- **FR-004**: The system MUST detect common invalid token states (invalid, expired, insufficient scopes) and present actionable error messages.
- **FR-005**: The system MUST allow analysis of private repositories when the provided token grants access to those repositories.
- **FR-006**: The system MUST NOT leak the token in user-visible logs, error messages, or analytics payloads.
- **FR-007**: The system MUST allow the user to remove the token at any time and must stop using it for subsequent requests after removal.
- **FR-008**: The UI MUST indicate when a token is in use and whether it enabled access to private repos for the current session.

*Security / privacy note*: Tokens will be treated as session-only and not persisted across browser sessions by default to minimize security risk. Users must re-enter tokens each new session unless an explicit future change is requested and approved.

### Key Entities *(include if feature involves data)*

- **Personal Access Token (PAT)**: short string supplied by the user; key attributes: scopes, creation date (external), expiry/revocation state (external), granted repository access.
- **Repository**: GitHub repo metadata and contents required for analysis.
- **Auth Session**: ephemeral association between a supplied token and the current user session (if persistence is implemented).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with a valid PAT and appropriate scopes can list their private repositories and start analysis within 2 minutes from entering the token.
- **SC-002**: When a valid PAT is supplied, the system reduces authenticated rate-limit failures for that user to less than 5% during a 1-hour test run of repeated analyses (compared to anonymous baseline).
- **SC-003**: Invalid-token cases present clear, actionable messages in at least 95% of test cases.
- **SC-004**: Users can remove the token and have subsequent requests treated as unauthenticated within the same session.

## Assumptions

- The token provided by users is a GitHub Personal Access Token (PAT) and the user understands how to create one.
- Default required scope to access private repos is assumed to be the standard `repo` scope unless clarified otherwise.
- Unless clarified, the default will be to treat tokens as session-only (not persisted long-term) to minimize security risk.


## Resolved Questions

1. Persistence: Tokens are treated as session-only and are not stored on disk or server. Users will need to re-enter tokens each browser session. This minimizes storage surface and reduces security risk.
2. Required scopes: Minimum supported scope is `repo` to enable private-repo analysis (read access to repository contents).
3. Expiry handling: The system will report failures when authenticated requests fail due to expired/revoked tokens; it will not proactively poll for expiry. Error messages should guide users to re-enter a fresh token.

```
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Constitution alignment for this project:
  - P1 MUST cover the full two-page user journey (repo input -> graph view).
  - Stories MUST preserve analysis source constraints (public GitHub + Gradle files).
  - Stories MUST define failure-state behavior and user messaging.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when repository URL is invalid or not public?
- How does the system handle missing `build.gradle` and `build.gradle.kts` files?
- How does the system behave on GitHub API rate-limit or network failure?
- How does the system ensure deterministic output for repeated runs on same input?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide exactly two user-facing pages: repository input
  and computed dependency graph result.
- **FR-002**: System MUST validate GitHub repository input before analysis.
- **FR-003**: System MUST analyze dependencies from public GitHub repository
  Gradle files (`build.gradle` or `build.gradle.kts`).
- **FR-004**: System MUST produce deterministic graph results for identical
  repository/ref/source inputs.
- **FR-005**: System MUST show clear, actionable error messaging for invalid
  input, missing Gradle files, and API/network/rate-limit failures.

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: A user can complete the full two-page flow (input -> graph)
  without documentation in under 2 minutes.
- **SC-002**: For identical repository/ref input, repeated analyses produce the
  same dependency categories and graph structure.
- **SC-003**: 95% of invalid-input and known external failure paths display
  explicit, actionable error messages.
- **SC-004**: The graph page remains usable on current desktop and mobile
  browsers without layout breakage in primary flow.
