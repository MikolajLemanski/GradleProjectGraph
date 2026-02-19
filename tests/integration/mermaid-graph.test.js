/**
 * Graph Generation Tests
 * Tests for Mermaid graph generation
 */

import { globalRunner, assert } from '../../js/test-runner.js';
import { generateMermaidDefinition } from '../../js/graph-page.js';

// Register test suite
globalRunner.suite('Mermaid Graph Generator', [
    {
        name: 'Generate graph for simple project',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' }
            ];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isDefined(mermaid);
            assert.isTrue(mermaid.includes('flowchart LR'));
            assert.isTrue(mermaid.includes('node_app'));
        }
    },
    {
        name: 'Generate graph with dependencies',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' },
                { projectPath: ':shared', displayName: 'shared' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':shared' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isTrue(mermaid.includes('node_app'));
            assert.isTrue(mermaid.includes('node_shared'));
            assert.isTrue(mermaid.includes('-->'));
        }
    },
    {
        name: 'Generate graph for multi-module project',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' },
                { projectPath: ':shared', displayName: 'shared' },
                { projectPath: ':core:ui', displayName: 'core:ui' },
                { projectPath: ':core:data', displayName: 'core:data' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':shared' },
                { fromProjectPath: ':app', toProjectPath: ':core:ui' },
                { fromProjectPath: ':core:ui', toProjectPath: ':core:data' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.hasLength(nodes, 4);
            assert.hasLength(edges, 3);
            assert.isTrue(mermaid.includes('flowchart LR'));
        }
    },
    {
        name: 'Handle empty graph',
        fn: () => {
            const nodes = [];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isDefined(mermaid);
            assert.isTrue(mermaid.includes('Empty'));
        }
    },
    {
        name: 'Escape special characters in labels',
        fn: () => {
            const nodes = [
                { projectPath: ':app-test', displayName: 'app-test' }
            ];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isDefined(mermaid);
            // Should handle special characters gracefully
            assert.isTrue(mermaid.includes('["app-test"]'));
        }
    },
    {
        name: 'Generate valid node IDs from paths',
        fn: () => {
            const nodes = [
                { projectPath: ':core:data:models', displayName: 'core:data:models' }
            ];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            // Verify node ID is sanitized (colons converted to underscores)
            assert.isTrue(mermaid.includes('node_core_data_models'));
        }
    },
    {
        name: 'Include styling classes',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' }
            ];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isTrue(mermaid.includes('classDef'));
        }
    },
    {
        name: 'Complex TinyComposer-like structure',
        fn: () => {
            const nodes = [
                { projectPath: ':', displayName: 'root' },
                { projectPath: ':shared', displayName: 'shared' },
                { projectPath: ':androidApp', displayName: 'androidApp' }
            ];
            const edges = [
                { fromProjectPath: ':androidApp', toProjectPath: ':shared' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isTrue(mermaid.length > 100, 'Should generate substantial output');
            assert.isTrue(mermaid.includes('node_root'));
            assert.isTrue(mermaid.includes('node_shared'));
            assert.isTrue(mermaid.includes('node_androidApp'));
        }
    }
]);

export { globalRunner };
