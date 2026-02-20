/**
 * End-to-End Graph Generation Tests
 * Tests the complete flow from parsed files to Mermaid output
 */

import { globalRunner, assert } from '../../js/test-runner.js';
import { 
    extractProjectDependencies, 
    buildProjectGraph,
    assembleGraphFromAnalysis
} from '../../js/gradle-parser.js';
import { generateMermaidDefinition } from '../../js/graph-page.js';

// Register test suite
globalRunner.suite('E2E Graph Generation', [
    {
        name: 'Generate valid Mermaid syntax from simple project',
        fn: () => {
            const parsedFiles = [
                {
                    path: 'app/build.gradle',
                    dependencies: [
                        { projectPath: ':shared' }
                    ],
                    warnings: []
                }
            ];
            
            const graph = buildProjectGraph(parsedFiles);
            const mermaid = generateMermaidDefinition(graph.nodes, graph.edges);
            
            // Verify basic structure
            assert.isTrue(mermaid.startsWith('flowchart LR'), 'Should start with flowchart LR');
            assert.isTrue(mermaid.includes('node_app'), 'Should include app node');
            assert.isTrue(mermaid.includes('node_shared'), 'Should include shared node');
            assert.isTrue(mermaid.includes('-->'), 'Should include arrow');
            assert.isTrue(mermaid.includes('classDef'), 'Should include styling');
        }
    },
    {
        name: 'Generate Mermaid definition with proper node labels',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' },
                { projectPath: ':shared', displayName: 'shared' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':shared' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            // Check for bracket labels (no quotes needed)
            assert.isTrue(mermaid.includes('[app]'), 'Should have app label');
            assert.isTrue(mermaid.includes('[shared]'), 'Should have shared label');
        }
    },
    {
        name: 'Generate valid Mermaid for multi-module project',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' },
                { projectPath: ':core:ui', displayName: 'core:ui' },
                { projectPath: ':core:data', displayName: 'core:data' },
                { projectPath: ':shared', displayName: 'shared' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':core:ui' },
                { fromProjectPath: ':app', toProjectPath: ':shared' },
                { fromProjectPath: ':core:ui', toProjectPath: ':core:data' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            // Verify all nodes present
            assert.isTrue(mermaid.includes('node_app'));
            assert.isTrue(mermaid.includes('node_core_ui'));
            assert.isTrue(mermaid.includes('node_core_data'));
            assert.isTrue(mermaid.includes('node_shared'));
            
            // Count arrows (should be 3)
            const arrowCount = (mermaid.match(/-->/g) || []).length;
            assert.equals(arrowCount, 3, 'Should have 3 arrows');
        }
    },
    {
        name: 'Root project is excluded from graph',
        fn: () => {
            const parsedFiles = [
                {
                    path: 'build.gradle',
                    dependencies: [
                        { projectPath: ':app' }
                    ],
                    warnings: []
                },
                {
                    path: 'app/build.gradle',
                    dependencies: [],
                    warnings: []
                }
            ];
            
            const graph = buildProjectGraph(parsedFiles);
            
            // Root project should be filtered out
            const rootNode = graph.nodes.find(n => n.projectPath === ':');
            assert.isNull(rootNode, 'Root node should not be in graph');
            
            // But app should be there
            const appNode = graph.nodes.find(n => n.projectPath === ':app');
            assert.isDefined(appNode, 'App node should be in graph');
        }
    },
    {
        name: 'Generate empty graph message when no nodes',
        fn: () => {
            const nodes = [];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isTrue(mermaid.includes('Empty'), 'Should show empty message');
            assert.isTrue(mermaid.includes('No Projects Found'), 'Should explain no projects');
        }
    },
    {
        name: 'Sanitize special characters in node IDs',
        fn: () => {
            const nodes = [
                { projectPath: ':my-app', displayName: 'my-app' },
                { projectPath: ':core:utils', displayName: 'core:utils' }
            ];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            // Hyphens and colons should be converted to underscores in IDs
            assert.isTrue(mermaid.includes('node_my_app'), 'Should sanitize hyphens');
            assert.isTrue(mermaid.includes('node_core_utils'), 'Should sanitize colons');
            
            // But labels should keep original formatting
            assert.isTrue(mermaid.includes('[my-app]'), 'Label should keep hyphen');
            assert.isTrue(mermaid.includes('[core:utils]'), 'Label should keep colon');
        }
    },
    {
        name: 'Full flow: Parse real Gradle file to Mermaid',
        fn: () => {
            const gradleContent = `
                dependencies {
                    implementation(project(":shared"))
                    implementation(project(":core:ui"))
                    implementation("androidx.core:core-ktx:1.9.0")
                }
            `;
            
            // Step 1: Parse
            const parseResult = extractProjectDependencies(gradleContent, 'app/build.gradle');
            assert.hasLength(parseResult.dependencies, 2, 'Should extract 2 project deps');
            
            // Step 2: Build graph
            const parsedFiles = [{
                path: 'app/build.gradle',
                dependencies: parseResult.dependencies,
                warnings: parseResult.warnings
            }];
            const graph = buildProjectGraph(parsedFiles);
            
            assert.greaterThan(graph.nodes.length, 0, 'Should have nodes');
            assert.greaterThan(graph.edges.length, 0, 'Should have edges');
            
            // Step 3: Generate Mermaid
            const mermaid = generateMermaidDefinition(graph.nodes, graph.edges);
            
            assert.isTrue(mermaid.startsWith('flowchart LR'), 'Should be valid Mermaid');
            assert.isTrue(mermaid.includes('node_shared'), 'Should include shared');
            assert.isTrue(mermaid.includes('node_core_ui'), 'Should include core:ui');
        }
    },
    {
        name: 'Verify Mermaid definition has no syntax errors',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' },
                { projectPath: ':shared', displayName: 'shared' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':shared' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            // Common Mermaid syntax requirements
            assert.isFalse(mermaid.includes('undefined'), 'Should not have undefined');
            assert.isFalse(mermaid.includes('null'), 'Should not have null');
            assert.isFalse(mermaid.includes('[object Object]'), 'Should not have object string');
            
            // Should have balanced brackets
            const openBrackets = (mermaid.match(/\[/g) || []).length;
            const closeBrackets = (mermaid.match(/\]/g) || []).length;
            assert.equals(openBrackets, closeBrackets, 'Should have balanced brackets');
        }
    },
    {
        name: 'Test TinyComposer-like structure',
        fn: () => {
            const analysisResult = {
                owner: 'lemcoder',
                repo: 'TinyComposer',
                resolvedRef: 'main',
                commitSha: 'abc1234',
                gradleFiles: [
                    {
                        path: 'androidApp/build.gradle.kts',
                        content: 'dependencies { implementation(projects.shared) }',
                        kind: 'build'
                    },
                    {
                        path: 'shared/build.gradle.kts',
                        content: 'dependencies { implementation(libs.kotlin.core) }',
                        kind: 'build'
                    }
                ],
                runId: 'test-123'
            };
            
            const graphResult = assembleGraphFromAnalysis(analysisResult);
            
            assert.isDefined(graphResult.nodes, 'Should have nodes');
            assert.isDefined(graphResult.edges, 'Should have edges');
            
            const mermaid = generateMermaidDefinition(graphResult.nodes, graphResult.edges);
            
            assert.isTrue(mermaid.startsWith('flowchart LR'), 'Should be valid flowchart');
            assert.greaterThan(mermaid.length, 50, 'Should generate substantial output');
        }
    },
    {
        name: 'Verify edges connect valid node IDs',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app' },
                { projectPath: ':shared', displayName: 'shared' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':shared' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            // Extract the node definitions and edge definitions
            const lines = mermaid.split('\n').filter(l => l.trim());
            
            // Find node IDs
            const nodeIds = [];
            lines.forEach(line => {
                const nodeMatch = line.match(/^\s+(node_\w+)\[/);
                if (nodeMatch) {
                    nodeIds.push(nodeMatch[1]);
                }
            });
            
            // Verify we found nodes
            assert.greaterThan(nodeIds.length, 0, 'Should find node IDs');
            
            // Check edge uses valid IDs
            assert.isTrue(mermaid.includes('node_app --> node_shared'), 'Edge should use valid node IDs');
        }
    },
    {
        name: 'Test graph with only nodes (no edges)',
        fn: () => {
            const nodes = [
                { projectPath: ':standalone', displayName: 'standalone' }
            ];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            assert.isTrue(mermaid.includes('node_standalone'), 'Should include node');
            assert.isTrue(mermaid.includes('[standalone]'), 'Should have label');
            assert.isFalse(mermaid.includes('-->'), 'Should not have arrows');
        }
    },
    {
        name: 'Escape special characters in display names',
        fn: () => {
            const nodes = [
                { projectPath: ':app', displayName: 'app-test' }
            ];
            const edges = [];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            // Label should be present
            assert.isDefined(mermaid);
            assert.isTrue(mermaid.includes('[app-test]'), 'Should include label');
        }
    },
    {
        name: 'Debug: Output sample Mermaid definition',
        fn: () => {
            const nodes = [
                { projectPath: ':androidApp', displayName: 'androidApp' },
                { projectPath: ':shared', displayName: 'shared' },
                { projectPath: ':core', displayName: 'core' }
            ];
            const edges = [
                { fromProjectPath: ':androidApp', toProjectPath: ':shared' },
                { fromProjectPath: ':shared', toProjectPath: ':core' }
            ];
            
            const mermaid = generateMermaidDefinition(nodes, edges);
            
            console.log('=== Generated Mermaid Definition ===');
            console.log(mermaid);
            console.log('=== End Mermaid Definition ===');
            
            // This test always passes, it's just for debugging
            assert.isTrue(true, 'Debug output logged to console');
        }
    }
]);

export { globalRunner };
