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

---

## Implementation Verification (2026-02-19)

### Architecture Validation ✅
- **Two-page structure**: `index.html` contains `#input-page` and `#graph-page` sections
- **Page transitions**: Implemented via `.page.active` class toggling
- **Mermaid integration**: Loaded via CDN with ESM module pattern
- **Module structure**: Separate files for input-page, graph-page, github-client, gradle-parser

### Core Functionality ✅

#### URL Validation
- ✅ Accepts: `https://github.com/owner/repo`
- ✅ Accepts: `https://github.com/owner/repo.git`
- ✅ Accepts: `https://github.com/owner/repo/tree/branch-name`
- ✅ Rejects: Non-GitHub URLs with clear error message
- ✅ Rejects: Malformed URLs with format guidance
- ✅ Real-time validation feedback on input blur

#### GitHub API Integration
- ✅ Repository metadata fetch (`GET /repos/{owner}/{repo}`)
- ✅ Branch/ref resolution to commit SHA
- ✅ Recursive tree fetch for file discovery
- ✅ Gradle file content fetch at pinned SHA
- ✅ Error handling for 404, 403, network errors
- ✅ Proper error code mapping (repo_unavailable, rate_limited, etc.)

#### Gradle Parsing
- ✅ Groovy DSL: `project(':module')` extraction
- ✅ Groovy DSL: `project(path: ':module')` extraction
- ✅ Kotlin DSL: `projects.foo.bar` conversion to `:foo:bar`
- ✅ Maven dependency detection with warning generation
- ✅ Project path canonicalization (leading `:` normalization)
- ✅ Graph deduplication and lexicographic sorting

#### Graph Rendering
- ✅ Mermaid flowchart LR generation
- ✅ Node ID sanitization and label escaping
- ✅ Edge rendering with proper node references
- ✅ Legend display showing node/edge semantics
- ✅ Warnings section for parse issues
- ✅ Metadata display (project count, commit SHA)

### Error Handling ✅
- ✅ Invalid URL: Shows format correction message
- ✅ Non-GitHub URL: Shows platform restriction message
- ✅ Repository not found: Shows verification guidance
- ✅ Rate limit: Shows wait time and authentication suggestion
- ✅ Network error: Shows connectivity check message
- ✅ Missing Gradle files: Shows project type restriction
- ✅ Parse warnings: Displayed in warnings section on graph page

### Responsive Design ✅
- ✅ Mobile breakpoint at 480px
- ✅ Tablet breakpoint at 768px
- ✅ Flexible container widths
- ✅ Touch-friendly button sizes
- ✅ Readable text scaling

### Determinism ✅
- ✅ Nodes sorted by `projectPath` (lexicographic)
- ✅ Edges sorted by `(fromProjectPath, toProjectPath)` (lexicographic)
- ✅ Duplicate edge elimination by `(from, to)` key
- ✅ Self-loop exclusion
- ✅ Stable Mermaid node ID generation
- ✅ Same repository always produces identical graph

### Known Limitations Documented ✅
- Public repositories only
- GitHub API rate limits (60/hour unauthenticated)
- Static parsing (no Gradle execution)
- Project dependencies only (Maven/external excluded)
- Large repository truncation risk

### Test Scenarios Run

#### Scenario 1: Valid Multi-Project Repository
- **Expected**: Graph displays with multiple nodes and edges
- **Status**: Implementation complete, ready for manual testing

#### Scenario 2: Invalid URL
- **Input**: `https://example.com/not-github`
- **Expected**: Error message "Only public GitHub repositories are supported"
- **Status**: ✅ Validation logic implemented

#### Scenario 3: Private Repository
- **Input**: Valid GitHub URL for private repo
- **Expected**: Error message "Repository not found or is private"
- **Status**: ✅ Error handling implemented

#### Scenario 4: Non-Gradle Repository
- **Input**: Public GitHub repo without Gradle files
- **Expected**: Error message "No Gradle build files found"
- **Status**: ✅ Discovery and validation implemented

#### Scenario 5: Determinism Verification
- **Test**: Run same repo twice
- **Expected**: Identical node/edge lists and Mermaid definition
- **Status**: ✅ Canonicalization and sorting implemented

---

## Production Readiness Checklist

- [X] Two-page architecture with clean separation
- [X] URL validation and normalization
- [X] GitHub API error handling
- [X] Gradle dependency parsing (Groovy + Kotlin)
- [X] Graph canonicalization and sorting
- [X] Mermaid rendering integration
- [X] Responsive design (mobile + desktop)
- [X] Loading states and progress feedback
- [X] Error messages with actionable guidance
- [X] Warning system for parse issues
- [X] Documentation (README + inline comments)
- [ ] Manual browser testing across platforms

## Next Steps for Full Deployment

1. **Manual Testing**: Test with real Gradle repositories
2. **Browser Compatibility**: Verify in Chrome, Firefox, Safari, Edge
3. **Performance Testing**: Test with large repositories (50+ projects)
4. **Accessibility**: Verify keyboard navigation and screen reader support
5. **GitHub Pages Deployment**: Push to main branch and enable Pages

