/**
 * Graph Page Controller
 * Handles graph rendering, state management, and result display
 */

// Initialize graph page
export function initGraphPage() {
    console.log('Graph page initialized');
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', handleBackClick);
    }
}

function handleBackClick() {
    // Import showInputPage dynamically to avoid circular dependency
    import('./input-page.js').then(module => {
        module.showInputPage();
    });
}

// T011: Mermaid definition generator for project-only graph
export function generateMermaidDefinition(nodes, edges) {
    if (!nodes || nodes.length === 0) {
        return 'graph LR\n  Empty["No Projects Found"]';
    }
    
    let mermaidDef = 'flowchart LR\n';
    
    // Generate node definitions
    const nodeIds = new Map();
    nodes.forEach((node, index) => {
        // Create stable node ID from project path
        const nodeId = `node_${sanitizeNodeId(node.projectPath)}`;
        nodeIds.set(node.projectPath, nodeId);
        
        // Use label directly (no quotes needed for simple labels)
        const label = node.displayName || node.projectPath;
        mermaidDef += `  ${nodeId}[${label}]\n`;
    });
    
    // Generate edges
    if (edges && edges.length > 0) {
        mermaidDef += '\n';
        edges.forEach(edge => {
            const fromId = nodeIds.get(edge.fromProjectPath);
            const toId = nodeIds.get(edge.toProjectPath);
            
            if (fromId && toId) {
                mermaidDef += `  ${fromId} --> ${toId}\n`;
            }
        });
    }
    
    // Add styling (optional)
    mermaidDef += '\n  classDef default fill:#f0f0f0,stroke:#333,stroke-width:2px;\n';
    
    return mermaidDef;
}

// Helper: Sanitize project path to valid Mermaid node ID
function sanitizeNodeId(projectPath) {
    // Remove leading ':' and replace remaining ':' with '_'
    return projectPath
        .replace(/^:/, '')
        .replace(/:/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '_') || 'root';
}

// Helper: Escape special characters for Mermaid labels
function escapeMermaidLabel(label) {
    return label
        .replace(/"/g, '#quot;')
        .replace(/\\/g, '\\\\');
}

// Render graph on page 2
export async function renderGraph(graphResult) {
    const loadingEl = document.getElementById('graph-loading');
    const errorEl = document.getElementById('graph-error');
    const resultsEl = document.getElementById('graph-results');
    const mermaidGraphEl = document.getElementById('mermaid-graph');
    const repoInfoEl = document.getElementById('repo-info');
    const warningsEl = document.getElementById('graph-warnings');
    const warningsListEl = document.getElementById('warnings-list');
    const metadataEl = document.getElementById('graph-metadata');
    
    // Reset state
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'none';
    
    try {
        if (!graphResult || !graphResult.nodes) {
            throw new Error('Invalid graph result');
        }
        
        // Show loading
        if (loadingEl) loadingEl.style.display = 'block';
        
        // Generate Mermaid definition
        const mermaidDef = generateMermaidDefinition(graphResult.nodes, graphResult.edges);
        
        // Update repository info
        if (repoInfoEl && graphResult.repository) {
            repoInfoEl.innerHTML = `
                <strong>Repository:</strong> ${graphResult.repository.owner}/${graphResult.repository.repo} 
                <span style="color: var(--color-text-muted);">@ ${graphResult.commitSha?.substring(0, 7)}</span>
            `;
        }
        
        // Render Mermaid graph
        if (mermaidGraphEl && window.mermaid) {
            try {
                console.log('Rendering Mermaid graph...');
                console.log('Graph data - Nodes:', graphResult.nodes.length, 'Edges:', graphResult.edges?.length || 0);
                
                // Clear previous content
                mermaidGraphEl.innerHTML = '';
                
                // Create a div for mermaid rendering
                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.style.textAlign = 'center';
                mermaidDiv.textContent = mermaidDef;
                mermaidGraphEl.appendChild(mermaidDiv);
                
                console.log('Mermaid def:', mermaidDef);
                
                // Small delay to ensure DOM is ready
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Render - use mermaid.run() which auto-detects .mermaid elements
                await window.mermaid.run();
                
                console.log('Mermaid graph rendered successfully');
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                mermaidGraphEl.innerHTML = `<div style="color: red; padding: 20px;">
                    <strong>Graph Rendering Error</strong>
                    <p>${escapeHtml(err.message || String(err))}</p>
                    <details>
                        <summary>Mermaid Definition</summary>
                        <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto;">${escapeHtml(mermaidDef)}</pre>
                    </details>
                </div>`;
            }
        }
        
        // Show warnings if any
        if (graphResult.warnings && graphResult.warnings.length > 0) {
            if (warningsListEl) {
                warningsListEl.innerHTML = graphResult.warnings
                    .map(w => `<li>${escapeHtml(w)}</li>`)
                    .join('');
            }
            if (warningsEl) warningsEl.style.display = 'block';
        }
        
        // Show metadata
        if (metadataEl) {
            metadataEl.innerHTML = `
                <p><strong>Projects Found:</strong> ${graphResult.nodes.length}</p>
                <p><strong>Dependencies:</strong> ${graphResult.edges?.length || 0}</p>
                <p><strong>Commit SHA:</strong> ${graphResult.commitSha}</p>
            `;
        }
        
        // Hide loading and show results
        if (loadingEl) loadingEl.style.display = 'none';
        if (resultsEl) resultsEl.style.display = 'block';
        
    } catch (error) {
        console.error('Graph rendering error:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.innerHTML = `<strong>Rendering Error</strong><p>${escapeHtml(error.message)}</p>`;
            errorEl.style.display = 'block';
        }
    }
}

// Helper: Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

