# Gradle Project Graph Viewer

A modern two-page web application for visualizing Gradle project dependencies from GitHub repositories. Built with vanilla JavaScript and Mermaid.js for clean, interactive dependency graphs.

## Features

- 🎯 **Two-Page Flow**: Clean separation between input and graph visualization
- 📊 **Project Dependencies Only**: Focuses on Gradle project-to-project dependencies (excludes external Maven libraries)
- 🔍 **Smart Discovery**: Recursively finds all `build.gradle` and `build.gradle.kts` files in your repository
- ✅ **Validation**: Real-time URL validation with helpful error messages
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with CSS custom properties and modern design tokens
- 🔒 **Deterministic**: Same input always produces the same graph output

## Quick Start

### Running Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/MikolajLemanski/GradleProjectGraph.git
   cd GradleProjectGraph
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Or using Node.js
   npx serve
   ```

3. Open your browser to `http://localhost:8080`

4. Enter a public GitHub repository URL and click "Analyze Repository"

### Example Repositories to Try

- `https://github.com/spring-projects/spring-boot`
- `https://github.com/gradle/gradle`
- Any public Gradle multi-project repository

## Usage

1. **Input Page**: Enter a GitHub repository URL
   - Supports: `https://github.com/owner/repo`
   - Optional branch: `https://github.com/owner/repo/tree/branch-name`
   - Real-time validation shows if URL is valid

2. **Analysis**: Click "Analyze Repository"
   - App fetches repository metadata
   - Discovers all Gradle build files
   - Parses project dependencies (Groovy and Kotlin DSL)

3. **Graph Page**: View the dependency graph
   - Mermaid flowchart showing project relationships
   - Legend explaining node and edge types
   - Warnings for any parsing issues
   - Metadata showing projects found and commit SHA

## Supported Patterns

The parser extracts project dependencies from these patterns:

### Groovy DSL
```groovy
dependencies {
    implementation project(':core')
    api project(path: ':shared')
}
```

### Kotlin DSL
```kotlin
dependencies {
    implementation(project(":core"))
    api(projects.shared.utils)
}
```

## Limitations

### GitHub API
- **Public repositories only**: Private repositories are not accessible
- **Rate limits**: 60 requests/hour without authentication, 5000/hour when authenticated
- **Large repositories**: Very large repositories (>1000 files) may be truncated by GitHub API

### Parsing
- **Project dependencies only**: External Maven/library dependencies are excluded from the graph
- **Static parsing**: Does not execute Gradle; uses pattern matching on source files
- **Supported files**: Only `build.gradle`, `build.gradle.kts`, `settings.gradle`, `settings.gradle.kts`

### Browser Requirements
- **Modern browsers**: Requires ES2020+ support (Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+)
- **JavaScript enabled**: Application requires JavaScript to function

### Browser Requirements
- **Modern browsers**: Requires ES2020+ support (Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+)
- **JavaScript enabled**: Application requires JavaScript to function

## How It Works

1. **URL Normalization**: Validates and parses GitHub repository URLs
2. **Metadata Fetch**: Retrieves repository information and resolves branch to commit SHA
3. **Tree Discovery**: Recursively lists all files in the repository
4. **File Filtering**: Identifies Gradle build files
5. **Content Fetch**: Downloads Gradle file content at pinned commit SHA
6. **Dependency Extraction**: Parses project dependencies using regex patterns
7. **Graph Canonicalization**: Deduplicates and sorts nodes/edges for deterministic output
8. **Mermaid Rendering**: Generates and displays interactive flowchart

## Project Structure

```
.
├── index.html              # Two-page HTML shell
├── style.css               # Modern CSS with design tokens
├── js/
│   ├── input-page.js       # Input validation and analysis orchestration
│   ├── graph-page.js       # Graph rendering and Mermaid integration
│   ├── github-client.js    # GitHub REST API client
│   └── gradle-parser.js    # Gradle dependency extraction
├── tests/
│   ├── integration/        # Integration test placeholders
│   └── parser/             # Parser unit test placeholders
└── specs/
    └── 001-gradle-graph-viewer/  # Feature specifications
```

## Deploying to GitHub Pages

1. **Enable GitHub Pages** in your repository settings:
   - Navigate to Settings → Pages
   - Set Source to your main branch
   - Click Save

2. **Access your website**:
   - URL: `https://yourusername.github.io/GradleProjectGraph/`
   - May take a few minutes to deploy

## Troubleshooting

### "Repository Not Available"
- Verify the repository is public
- Check the URL format is correct
- Ensure the repository exists

### "Rate Limit Exceeded"
- Wait 60 minutes for rate limit reset
- Authenticate with GitHub for higher limits (not currently supported in this version)

### "No Gradle Files Found"
- Verify the repository contains Gradle build files
- Check if files are in standard locations
- This tool only works with Gradle projects

### Graph Not Rendering
- Check browser console for errors
- Verify Mermaid.js loaded successfully
- Try refreshing the page

## Contributing

This is a learning project. Feel free to fork and experiment!

## License

See [LICENSE](LICENSE) file for details.