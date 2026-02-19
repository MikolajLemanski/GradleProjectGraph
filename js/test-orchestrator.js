/**
 * Test Suite Orchestrator
 * Loads and runs all test suites
 */

import { globalRunner } from './test-runner.js';

// Import all test suites (this registers them with globalRunner)
import '../tests/parser/gradle-parser.test.js';
import '../tests/integration/github-client.test.js';
import '../tests/integration/mermaid-graph.test.js';

/**
 * Run all tests and return results
 */
export async function runAllTests() {
    console.log('Running health check tests...');
    const results = await globalRunner.runAll();
    console.log('Tests complete:', results);
    return results;
}

/**
 * Format test results for display
 */
export function formatTestResults(results) {
    const { total, passed, failed, duration, details } = results;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return {
        summary: {
            total,
            passed,
            failed,
            passRate,
            duration: Math.round(duration),
            status: failed === 0 ? 'success' : 'failure'
        },
        details: details || []
    };
}

/**
 * Display test results in the UI
 */
export function displayTestResults(results, containerId = 'test-results') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Test results container not found');
        return;
    }
    
    const formatted = formatTestResults(results);
    const { summary, details } = formatted;
    
    // Build HTML
    let html = `
        <div class="test-summary ${summary.status}">
            <h3>
                ${summary.status === 'success' ? '✓' : '✗'} 
                Health Check Results
            </h3>
            <div class="test-stats">
                <div class="stat">
                    <span class="stat-value">${summary.passed}/${summary.total}</span>
                    <span class="stat-label">Passed</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${summary.passRate}%</span>
                    <span class="stat-label">Pass Rate</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${summary.duration}ms</span>
                    <span class="stat-label">Duration</span>
                </div>
            </div>
        </div>
    `;
    
    if (details.length > 0) {
        html += '<div class="test-details">';
        html += '<h4>Test Details</h4>';
        html += '<ul class="test-list">';
        
        details.forEach(test => {
            const icon = test.status === 'passed' ? '✓' : '✗';
            const className = test.status === 'passed' ? 'test-pass' : 'test-fail';
            const duration = test.duration ? ` (${Math.round(test.duration)}ms)` : '';
            
            html += `<li class="${className}">
                <span class="test-icon">${icon}</span>
                <span class="test-name">${escapeHtml(test.name)}</span>
                ${duration}
            `;
            
            if (test.error) {
                html += `<div class="test-error">${escapeHtml(test.error)}</div>`;
            }
            
            html += '</li>';
        });
        
        html += '</ul>';
        html += '</div>';
    }
    
    container.innerHTML = html;
    container.style.display = 'block';
}

// Helper to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export for global access
window.runAllTests = runAllTests;
window.displayTestResults = displayTestResults;
