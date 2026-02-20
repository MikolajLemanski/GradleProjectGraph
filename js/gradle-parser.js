/**
 * Gradle Parser
 * Extracts project dependencies from Gradle build files
 */

// T009: Gradle project dependency extraction for Groovy and Kotlin patterns
export function extractProjectDependencies(content, filePath) {
    const dependencies = [];
    const warnings = [];
    
    // Pattern 1: Groovy-style project(':module') or project(":module")
    const groovyPattern1 = /\bproject\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    
    // Pattern 2: Groovy-style project(path: ':module') or project(path = ":module")
    const groovyPattern2 = /\bproject\s*\(\s*path\s*[:=]\s*['"]([^'"]+)['"]\s*\)/g;
    
    // Pattern 3: Kotlin-style projects.foo.bar reference
    const kotlinProjectsPattern = /\bprojects\.([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*)\b/g;
    
    // Extract Groovy-style project(':module')
    let match;
    while ((match = groovyPattern1.exec(content)) !== null) {
        const projectPath = match[1];
        if (projectPath && projectPath.startsWith(':')) {
            dependencies.push({
                projectPath: projectPath,
                sourceFile: filePath,
                pattern: 'groovy_project'
            });
        }
    }
    
    // Extract Groovy-style project(path: ':module')
    while ((match = groovyPattern2.exec(content)) !== null) {
        const projectPath = match[1];
        if (projectPath && projectPath.startsWith(':')) {
            dependencies.push({
                projectPath: projectPath,
                sourceFile: filePath,
                pattern: 'groovy_project_path'
            });
        }
    }
    
    // Extract Kotlin-style projects.foo.bar
    while ( (match = kotlinProjectsPattern.exec(content)) !== null) {
        const dotPath = match[1];
        // Convert projects.foo.bar to :foo:bar
        const projectPath = ':' + dotPath.replace(/\./g, ':');
        dependencies.push({
            projectPath: projectPath,
            sourceFile: filePath,
            pattern: 'kotlin_projects_accessor'
        });
    }
    
    // Detect and warn about external/Maven dependencies (for transparency)
    const mavenPattern = /\b(implementation|api|compileOnly|runtimeOnly|testImplementation)\s*\(\s*['"]([^'"]+:[^'"]+:[^'"]+)['"]/g;
    const versionCatalogPattern = /\b(implementation|api|compileOnly|runtimeOnly|testImplementation)\s*\(\s*(libs\.|compose\.)([a-zA-Z0-9_.]+)\s*\)/g;
    
    let mavenMatches = 0;
    while ((match = mavenPattern.exec(content)) !== null) {
        mavenMatches++;
    }
    
    while ((match = versionCatalogPattern.exec(content)) !== null) {
        mavenMatches++;
    }
    
    if (mavenMatches > 0) {
        warnings.push(`File ${filePath} contains ${mavenMatches} external (Maven/library) dependencies that are excluded from the graph`);
    }
    
    return {
        dependencies,
        warnings
    };
}

export function parseGradleFile(content, filePath) {
    return extractProjectDependencies(content, filePath);
}

// T010: Graph canonicalization and deterministic sort/dedup
export function canonicalizeGraph(rawNodes, rawEdges) {
    // Step 1: Ensure all project paths start with ':' and normalize
    const normalizedNodes = rawNodes.map(node => {
        let path = node.projectPath || node;
        if (typeof path === 'string' && !path.startsWith(':')) {
            path = ':' + path;
        }
        return {
            projectPath: path,
            displayName: path.substring(1) || 'root' // Remove leading ':'
        };
    });
    
    // Step 2: Deduplicate nodes by projectPath
    const uniqueNodesMap = new Map();
    normalizedNodes.forEach(node => {
        if (!uniqueNodesMap.has(node.projectPath)) {
            uniqueNodesMap.set(node.projectPath, node);
        }
    });
    
    // Step 3: Sort nodes lexicographically by projectPath
    const sortedNodes = Array.from(uniqueNodesMap.values()).sort((a, b) => 
        a.projectPath.localeCompare(b.projectPath)
    );
    
    // Step 4: Normalize edges
    const normalizedEdges = rawEdges.map(edge => ({
        fromProjectPath: edge.fromProjectPath || edge.from,
        toProjectPath: edge.toProjectPath || edge.to,
        sourceFilePath: edge.sourceFilePath || edge.sourceFile
    }));
    
    // Step 5: Deduplicate edges by (from, to) pair
    const uniqueEdgesMap = new Map();
    normalizedEdges.forEach(edge => {
        const key = `${edge.fromProjectPath}→${edge.toProjectPath}`;
        if (!uniqueEdgesMap.has(key)) {
            // Filter out self-loops
            if (edge.fromProjectPath !== edge.toProjectPath) {
                uniqueEdgesMap.set(key, edge);
            }
        }
    });
    
    // Step 6: Sort edges lexicographically by fromProjectPath, then toProjectPath
    const sortedEdges = Array.from(uniqueEdgesMap.values()).sort((a, b) => {
        const fromCompare = a.fromProjectPath.localeCompare(b.fromProjectPath);
        if (fromCompare !== 0) return fromCompare;
        return a.toProjectPath.localeCompare(b.toProjectPath);
    });
    
    return {
        nodes: sortedNodes,
        edges: sortedEdges
    };
}

// Build graph from parsed Gradle files
export function buildProjectGraph(parsedFiles) {
    const allDependencies = [];
    const allWarnings = [];
    const projectsSet = new Set();
    
    // Collect all dependencies and warnings
    parsedFiles.forEach(file => {
        if (file.dependencies) {
            allDependencies.push(...file.dependencies);
        }
        if (file.warnings) {
            allWarnings.push(...file.warnings);
        }
    });
    
    // Build nodes: collect unique projects
    // Both "from" (source of dependency declaration) and "to" (target dependency)
    const edges = [];
    
    parsedFiles.forEach(file => {
        // Determine the project path from file path
        // e.g., "app/build.gradle" -> ":app"
        // "build.gradle" -> ":" (root)
        const projectPath = inferProjectPathFromFile(file.path);
        projectsSet.add(projectPath);
        
        // Add edges for each dependency
        if (file.dependencies) {
            file.dependencies.forEach(dep => {
                projectsSet.add(dep.projectPath);
                edges.push({
                    fromProjectPath: projectPath,
                    toProjectPath: dep.projectPath,
                    sourceFilePath: file.path
                });
            });
        }
    });
    
    // Convert projects set to nodes array, excluding root project
    const nodes = Array.from(projectsSet)
        .filter(path => path !== ':')
        .map(path => ({ projectPath: path }));
    
    // Filter out edges involving root project
    const filteredEdges = edges.filter(edge => 
        edge.fromProjectPath !== ':' && edge.toProjectPath !== ':'
    );
    
    // Canonicalize the graph
    const canonical = canonicalizeGraph(nodes, filteredEdges);
    
    return {
        nodes: canonical.nodes,
        edges: canonical.edges,
        warnings: allWarnings
    };
}

// Helper: Infer project path from file path
function inferProjectPathFromFile(filePath) {
    // Remove filename to get directory
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash === -1) {
        // Root-level build.gradle
        return ':';
    }
    
    const dirPath = filePath.substring(0, lastSlash);
    
    // Convert directory path to Gradle project path
    // e.g., "app" -> ":app"
    // e.g., "libs/core" -> ":libs:core"
    return ':' + dirPath.replace(/\//g, ':');
}

// T015: Build project node/edge graph result assembly from parsed files
export function assembleGraphFromAnalysis(analysisResult) {
    const parsedFiles = [];
    const allWarnings = [];
    
    // Parse each Gradle file
    analysisResult.gradleFiles.forEach(file => {
        const parseResult = parseGradleFile(file.content, file.path);
        parsedFiles.push({
            path: file.path,
            kind: file.kind,
            dependencies: parseResult.dependencies,
            warnings: parseResult.warnings
        });
        
        if (parseResult.warnings) {
            allWarnings.push(...parseResult.warnings);
        }
    });
    
    // Build graph from parsed files
    const graph = buildProjectGraph(parsedFiles);
    
    // Assemble final graph result
    const graphResult = {
        repository: {
            owner: analysisResult.owner,
            repo: analysisResult.repo,
            normalizedOwner: analysisResult.owner,
            normalizedRepo: analysisResult.repo,
            normalizedRef: analysisResult.resolvedRef
        },
        commitSha: analysisResult.commitSha,
        nodes: graph.nodes,
        edges: graph.edges,
        warnings: [...allWarnings, ...graph.warnings],
        filesAnalyzed: parsedFiles.length,
        runId: analysisResult.runId
    };
    
    return graphResult;
}


