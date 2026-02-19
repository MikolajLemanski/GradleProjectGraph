/**
 * GitHub Client
 * Handles GitHub REST API interactions for repository metadata and file fetching
 */

const GITHUB_API_BASE = 'https://api.github.com';

// T006: GitHub repository metadata and branch/ref resolution
export async function getRepositoryMetadata(owner, repo) {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
    
    try {
        const response = await fetch(url);
        
        if (response.status === 404) {
            throw {
                errorCode: 'repo_unavailable',
                message: 'Repository not found or is private',
                status: 404
            };
        }
        
        if (response.status === 403) {
            throw {
                errorCode: 'rate_limited',
                message: 'GitHub API rate limit exceeded',
                status: 403
            };
        }
        
        if (!response.ok) {
            throw {
                errorCode: 'api_error',
                message: `GitHub API returned status ${response.status}`,
                status: response.status
            };
        }
        
        const data = await response.json();
        
        return {
            owner: data.owner.login,
            repo: data.name,
            defaultBranch: data.default_branch,
            private: data.private,
            fullName: data.full_name
        };
    } catch (error) {
        if (error.errorCode) {
            throw error;
        }
        throw {
            errorCode: 'network_error',
            message: 'Failed to connect to GitHub API',
            originalError: error
        };
    }
}

export async function resolveRefToCommitSha(owner, repo, ref) {
    // If no ref provided, get default branch from metadata
    if (!ref) {
        const metadata = await getRepositoryMetadata(owner, repo);
        ref = metadata.defaultBranch;
    }
    
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${ref}`;
    
    try {
        const response = await fetch(url);
        
        if (response.status === 404) {
            // Try as a tag instead of branch
            const tagUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/tags/${ref}`;
            const tagResponse = await fetch(tagUrl);
            
            if (tagResponse.status === 404) {
                throw {
                    errorCode: 'api_error',
                    message: `Branch or tag '${ref}' not found`,
                    status: 404
                };
            }
            
            if (!tagResponse.ok) {
                throw {
                    errorCode: 'api_error',
                    message: `Failed to resolve ref '${ref}'`,
                    status: tagResponse.status
                };
            }
            
            const tagData = await tagResponse.json();
            return {
                ref: ref,
                sha: tagData.object.sha,
                type: 'tag'
            };
        }
        
        if (!response.ok) {
            throw {
                errorCode: 'api_error',
                message: `Failed to resolve branch '${ref}'`,
                status: response.status
            };
        }
        
        const data = await response.json();
        
        return {
            ref: ref,
            sha: data.object.sha,
            type: 'branch'
        };
    } catch (error) {
        if (error.errorCode) {
            throw error;
        }
        throw {
            errorCode: 'network_error',
            message: 'Failed to resolve Git reference',
            originalError: error
        };
    }
}

// T007: Recursive tree fetch and Gradle file discovery
export async function getRecursiveTree(owner, repo, treeSha) {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw {
                errorCode: 'api_error',
                message: `Failed to fetch repository tree (status ${response.status})`,
                status: response.status
            };
        }
        
        const data = await response.json();
        
        return {
            sha: data.sha,
            tree: data.tree,
            truncated: data.truncated
        };
    } catch (error) {
        if (error.errorCode) {
            throw error;
        }
        throw {
            errorCode: 'network_error',
            message: 'Failed to fetch repository tree',
            originalError: error
        };
    }
}

export function discoverGradleFiles(tree) {
    const gradleFilePatterns = [
        /build\.gradle$/,
        /build\.gradle\.kts$/,
        /settings\.gradle$/,
        /settings\.gradle\.kts$/
    ];
    
    const gradleFiles = tree.filter(entry => {
        if (entry.type !== 'blob') return false;
        
        return gradleFilePatterns.some(pattern => pattern.test(entry.path));
    });
    
    return gradleFiles.map(entry => ({
        path: entry.path,
        sha: entry.sha,
        size: entry.size,
        kind: determineGradleFileKind(entry.path)
    }));
}

function determineGradleFileKind(path) {
    if (path.endsWith('build.gradle')) return 'build_gradle';
    if (path.endsWith('build.gradle.kts')) return 'build_gradle_kts';
    if (path.endsWith('settings.gradle')) return 'settings_gradle';
    if (path.endsWith('settings.gradle.kts')) return 'settings_gradle_kts';
    return 'unknown';
}

// T008: Pinned-SHA file content fetch and decode
export async function getFileContent(owner, repo, path, ref) {
    const encodedPath = encodeURIComponent(path);
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw {
                errorCode: 'api_error',
                message: `Failed to fetch file '${path}' (status ${response.status})`,
                status: response.status,
                path: path
            };
        }
        
        const data = await response.json();
        
        // Decode base64 content
        const decodedContent = atob(data.content.replace(/\s/g, ''));
        
        return {
            path: data.path,
            sha: data.sha,
            size: data.size,
            content: decodedContent,
            encoding: data.encoding
        };
    } catch (error) {
        if (error.errorCode) {
            throw error;
        }
        throw {
            errorCode: 'network_error',
            message: `Failed to fetch file '${path}'`,
            originalError: error
        };
    }
}

// Batch fetch multiple files
export async function fetchGradleFilesContent(owner, repo, gradleFiles, commitSha) {
    const filePromises = gradleFiles.map(file => 
        getFileContent(owner, repo, file.path, commitSha)
            .then(content => ({
                ...file,
                content: content.content
            }))
            .catch(error => ({
                ...file,
                error: error,
                content: null
            }))
    );
    
    return await Promise.all(filePromises);
}

// T014: Orchestrated GitHub fetch sequence
export async function analyzeRepository(owner, repo, ref = null) {
    const runId = `run_${Date.now()}`;
    const startedAt = new Date().toISOString();
    
    try {
        // Step 1: Fetch repository metadata
        const metadata = await getRepositoryMetadata(owner, repo);
        
        // Step 2: Resolve ref to commit SHA
        const resolvedRef = await resolveRefToCommitSha(owner, repo, ref);
        const commitSha = resolvedRef.sha;
        
        // Step 3: Fetch recursive tree
        const treeData = await getRecursiveTree(owner, repo, commitSha);
        
        // Step 4: Discover Gradle files
        const gradleFiles = discoverGradleFiles(treeData.tree);
        
        if (gradleFiles.length === 0) {
            throw {
                errorCode: 'missing_gradle_files',
                message: 'No Gradle build files found in repository'
            };
        }
        
        // Step 5: Fetch content of all Gradle files
        const filesWithContent = await fetchGradleFilesContent(owner, repo, gradleFiles, commitSha);
        
        // Filter out files that failed to fetch
        const validFiles = filesWithContent.filter(f => f.content !== null);
        
        if (validFiles.length === 0) {
            throw {
                errorCode: 'api_error',
                message: 'Failed to fetch any Gradle file content'
            };
        }
        
        return {
            runId,
            owner,
            repo,
            resolvedRef: resolvedRef.ref,
            commitSha,
            startedAt,
            gradleFiles: validFiles,
            metadata
        };
    } catch (error) {
        if (error.errorCode) {
            throw error;
        }
        throw {
            errorCode: 'api_error',
            message: error.message || 'Unknown error during repository analysis'
        };
    }
}


