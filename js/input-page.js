/**
 * Input Page Controller
 * Handles repository URL input, validation, and analysis initiation
 */

// Page state
let currentPage = 'input';

// Initialize input page
export function initInputPage() {
    console.log('Input page initialized');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const repoUrlInput = document.getElementById('repoUrl');
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyzeClick);
    }
    
    if (repoUrlInput) {
        repoUrlInput.addEventListener('input', handleUrlInput);
        repoUrlInput.addEventListener('blur', handleUrlBlur);
    }
}

// T005: Repository URL normalization and parsing
export function normalizeRepositoryUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
        return {
            isValid: false,
            errorCode: 'invalid_url',
            message: 'Please enter a valid URL'
        };
    }
    
    const trimmed = rawUrl.trim();
    
    // Check if it's a GitHub URL
    const githubPattern = /^https?:\/\/(www\.)?github\.com\//;
    if (!githubPattern.test(trimmed)) {
        return {
            isValid: false,
            errorCode: 'unsupported_url',
            message: 'Only GitHub repository URLs are supported'
        };
    }
    
    // Parse GitHub URL patterns:
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // https://github.com/owner/repo/
    // https://github.com/owner/repo/tree/branch-name
    const urlPattern = /^https?:\/\/(www\.)?github\.com\/([^\/]+)\/([^\/\.]+?)(\.git)?(\/tree\/([^\/]+))?\/?$/;
    const match = trimmed.match(urlPattern);
    
    if (!match) {
        return {
            isValid: false,
            errorCode: 'invalid_url',
            message: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo'
        };
    }
    
    const owner = match[2];
    const repo = match[3];
    const ref = match[6] || null; // Optional branch/ref from /tree/ref
    
    // Validate owner and repo are not empty
    if (!owner || !repo) {
        return {
            isValid: false,
            errorCode: 'invalid_url',
            message: 'Repository owner and name are required'
        };
    }
    
    return {
        isValid: true,
        normalizedOwner: owner,
        normalizedRepo: repo,
        normalizedRef: ref,
        rawUrl: trimmed
    };
}

// T012: Error code mapping and user message formatting
export function formatErrorMessage(errorCode, context = {}) {
    const errorMessages = {
        'invalid_url': {
            title: 'Invalid URL',
            message: 'Please enter a valid GitHub repository URL.',
            suggestion: 'Example: https://github.com/owner/repo'
        },
        'unsupported_url': {
            title: 'Unsupported URL',
            message: 'Only public GitHub repositories are supported.',
            suggestion: 'Make sure the URL starts with https://github.com/'
        },
        'repo_unavailable': {
            title: 'Repository Not Available',
            message: 'The repository could not be accessed.',
            suggestion: 'Verify the repository exists and is public, or check your network connection.'
        },
        'missing_gradle_files': {
            title: 'No Gradle Files Found',
            message: 'No build.gradle or build.gradle.kts files were found in this repository.',
            suggestion: 'This tool only works with Gradle projects.'
        },
        'rate_limited': {
            title: 'Rate Limit Exceeded',
            message: context.resetTime 
                ? `GitHub API rate limit exceeded. Resets at ${new Date(context.resetTime).toLocaleTimeString()}.`
                : 'GitHub API rate limit has been exceeded.',
            suggestion: context.remaining !== undefined && context.remaining === 0
                ? 'You have used all available requests. Wait for the rate limit to reset, or authenticate with GitHub for higher limits (5000/hour).'
                : 'Please wait a few minutes and try again, or authenticate with GitHub for higher limits.'
        },
        'network_error': {
            title: 'Network Error',
            message: 'Failed to connect to GitHub API.',
            suggestion: 'Check your internet connection and try again.'
        },
        'api_error': {
            title: 'API Error',
            message: context.message || 'An error occurred while accessing the GitHub API.',
            suggestion: 'Please try again later.'
        },
        'parse_error': {
            title: 'Parse Error',
            message: 'Failed to parse Gradle dependency information.',
            suggestion: 'The build files may contain unsupported syntax.'
        }
    };
    
    const error = errorMessages[errorCode] || errorMessages['api_error'];
    return {
        title: error.title,
        message: error.message,
        suggestion: error.suggestion,
        errorCode
    };
}

// UI Event Handlers
function handleUrlInput(event) {
    const validationMessage = document.getElementById('validation-message');
    if (validationMessage) {
        validationMessage.textContent = '';
        validationMessage.className = 'validation-message';
    }
}

function handleUrlBlur(event) {
    const url = event.target.value.trim();
    if (!url) return;
    
    const result = normalizeRepositoryUrl(url);
    const validationMessage = document.getElementById('validation-message');
    
    if (!validationMessage) return;
    
    if (result.isValid) {
        validationMessage.textContent = `✓ Valid repository: ${result.normalizedOwner}/${result.normalizedRepo}`;
        validationMessage.className = 'validation-message success';
    } else {
        const error = formatErrorMessage(result.errorCode);
        validationMessage.textContent = `✗ ${error.message}`;
        validationMessage.className = 'validation-message error';
    }
}

async function handleAnalyzeClick() {
    const repoUrlInput = document.getElementById('repoUrl');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingEl = document.getElementById('input-loading');
    const errorEl = document.getElementById('input-error');
    const validationMessage = document.getElementById('validation-message');
    
    if (!repoUrlInput) return;
    
    const rawUrl = repoUrlInput.value.trim();
    
    // Reset UI
    if (errorEl) errorEl.style.display = 'none';
    if (validationMessage) {
        validationMessage.textContent = '';
        validationMessage.className = 'validation-message';
    }
    
    // Validate URL
    const result = normalizeRepositoryUrl(rawUrl);
    
    if (!result.isValid) {
        const error = formatErrorMessage(result.errorCode);
        if (errorEl) {
            errorEl.innerHTML = `<strong>${error.title}</strong><p>${error.message}</p><p class="suggestion">${error.suggestion}</p>`;
            errorEl.style.display = 'block';
        }
        return;
    }
    
    // Show loading state
    if (analyzeBtn) analyzeBtn.disabled = true;
    if (loadingEl) loadingEl.style.display = 'block';
    
    // T013: Wire analyze action to analysis pipeline
    try {
        // Import modules
        const githubClient = await import('./github-client.js');
        const gradleParser = await import('./gradle-parser.js');
        const graphPage = await import('./graph-page.js');
        
        // Get UI elements for progress updates
        const loadingMessage = document.getElementById('loading-message');
        const loadingDetail = document.getElementById('loading-detail');
        
        // Run analysis with progress callback
        const analysisResult = await githubClient.analyzeRepository(
            result.normalizedOwner,
            result.normalizedRepo,
            result.normalizedRef,
            (progress) => {
                // Update loading message based on progress
                if (loadingMessage) {
                    loadingMessage.textContent = progress.message || 'Analyzing repository...';
                }
                if (loadingDetail) {
                    if (progress.detail) {
                        loadingDetail.textContent = progress.detail;
                        if (progress.remaining !== undefined) {
                            loadingDetail.textContent += ` (${progress.remaining} API requests remaining)`;
                        }
                    } else {
                        loadingDetail.textContent = '';
                    }
                }
            }
        );
        
        // Update final message
        if (loadingMessage) loadingMessage.textContent = 'Building dependency graph...';
        if (loadingDetail) loadingDetail.textContent = '';
        
        // Assemble graph from analysis
        const graphResult = gradleParser.assembleGraphFromAnalysis(analysisResult);
        
        // Hide loading
        if (loadingEl) loadingEl.style.display = 'none';
        if (analyzeBtn) analyzeBtn.disabled = false;
        
        // T017: Transition to graph page
        showGraphPage();
        
        // T016: Render graph
        await graphPage.renderGraph(graphResult);
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (analyzeBtn) analyzeBtn.disabled = false;
        
        // Format error message
        const formattedError = formatErrorMessage(error.errorCode || 'api_error', {
            message: error.message,
            resetTime: error.resetTime,
            remaining: error.remaining
        });
        
        if (errorEl) {
            errorEl.innerHTML = `<strong>${formattedError.title}</strong><p>${formattedError.message}</p><p class="suggestion">${formattedError.suggestion}</p>`;
            errorEl.style.display = 'block';
        }
    }
}

export function showInputPage() {
    const inputPage = document.getElementById('input-page');
    const graphPage = document.getElementById('graph-page');
    
    if (inputPage) inputPage.classList.add('active');
    if (graphPage) graphPage.classList.remove('active');
    currentPage = 'input';
}

// T017: Page transition management
export function showGraphPage() {
    const inputPage = document.getElementById('input-page');
    const graphPage = document.getElementById('graph-page');
    
    if (inputPage) inputPage.classList.remove('active');
    if (graphPage) graphPage.classList.add('active');
    currentPage = 'graph';
    
    // Scroll to top of new page
    window.scrollTo(0, 0);
}


