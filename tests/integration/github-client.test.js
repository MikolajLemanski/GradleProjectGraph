/**
 * GitHub Client Integration Tests
 * Tests with mock data for GitHub API interactions
 */

import { globalRunner, assert } from '../../js/test-runner.js';
import { normalizeRepositoryUrl } from '../../js/input-page.js';

// Mock sample data from the API schema you provided
const MOCK_REPO_METADATA = {
  "id": 884419324,
  "name": "TinyComposer",
  "full_name": "lemcoder/TinyComposer",
  "owner": {
    "login": "lemcoder"
  },
  "default_branch": "main",
  "private": false
};

const MOCK_GRADLE_FILE_RESPONSE = {
  "name": "build.gradle.kts",
  "path": "shared/build.gradle.kts",
  "sha": "691efb0a615d7a4a955094f6c2f0865c6d48ca08",
  "type": "file",
  "content": "cGx1Z2lucyB7CiAgICBhbGlhcyhsaWJzLnBsdWdpbnMua290bGluTXVsdGlwbGF0Zm9ybSkKfQ==",
  "encoding": "base64"
};

// Register test suite
globalRunner.suite('GitHub Client', [
    {
        name: 'Normalize valid GitHub URL',
        fn: () => {
            const result = normalizeRepositoryUrl('https://github.com/lemcoder/TinyComposer');
            
            assert.isTrue(result.isValid);
            assert.equals(result.normalizedOwner, 'lemcoder');
            assert.equals(result.normalizedRepo, 'TinyComposer');
            assert.isNull(result.normalizedRef);
        }
    },
    {
        name: 'Normalize GitHub URL with branch',
        fn: () => {
            const result = normalizeRepositoryUrl('https://github.com/owner/repo/tree/develop');
            
            assert.isTrue(result.isValid);
            assert.equals(result.normalizedOwner, 'owner');
            assert.equals(result.normalizedRepo, 'repo');
            assert.equals(result.normalizedRef, 'develop');
        }
    },
    {
        name: 'Normalize GitHub URL with .git extension',
        fn: () => {
            const result = normalizeRepositoryUrl('https://github.com/owner/repo.git');
            
            assert.isTrue(result.isValid);
            assert.equals(result.normalizedOwner, 'owner');
            assert.equals(result.normalizedRepo, 'repo');
        }
    },
    {
        name: 'Reject invalid URL',
        fn: () => {
            const result = normalizeRepositoryUrl('not-a-url');
            
            assert.isFalse(result.isValid);
            assert.equals(result.errorCode, 'unsupported_url');
        }
    },
    {
        name: 'Reject non-GitHub URL',
        fn: () => {
            const result = normalizeRepositoryUrl('https://gitlab.com/owner/repo');
            
            assert.isFalse(result.isValid);
            assert.equals(result.errorCode, 'unsupported_url');
        }
    },
    {
        name: 'Reject empty URL',
        fn: () => {
            const result = normalizeRepositoryUrl('');
            
            assert.isFalse(result.isValid);
            assert.equals(result.errorCode, 'invalid_url');
        }
    },
    {
        name: 'Handle URL with trailing slash',
        fn: () => {
            const result = normalizeRepositoryUrl('https://github.com/owner/repo/');
            
            assert.isTrue(result.isValid);
            assert.equals(result.normalizedOwner, 'owner');
            assert.equals(result.normalizedRepo, 'repo');
        }
    },
    {
        name: 'Handle www prefix',
        fn: () => {
            const result = normalizeRepositoryUrl('https://www.github.com/owner/repo');
            
            assert.isTrue(result.isValid);
            assert.equals(result.normalizedOwner, 'owner');
            assert.equals(result.normalizedRepo, 'repo');
        }
    },
    {
        name: 'Decode base64 content',
        fn: () => {
            const content = MOCK_GRADLE_FILE_RESPONSE.content;
            const decoded = atob(content);
            
            assert.isDefined(decoded);
            assert.greaterThan(decoded.length, 0);
            assert.isTrue(decoded.includes('plugins'));
        }
    },
    {
        name: 'Validate mock repo metadata structure',
        fn: () => {
            assert.isDefined(MOCK_REPO_METADATA.owner);
            assert.equals(MOCK_REPO_METADATA.owner.login, 'lemcoder');
            assert.equals(MOCK_REPO_METADATA.name, 'TinyComposer');
            assert.equals(MOCK_REPO_METADATA.default_branch, 'main');
            assert.isFalse(MOCK_REPO_METADATA.private);
        }
    },
    {
        name: 'Validate mock file response structure',
        fn: () => {
            assert.equals(MOCK_GRADLE_FILE_RESPONSE.type, 'file');
            assert.equals(MOCK_GRADLE_FILE_RESPONSE.encoding, 'base64');
            assert.isDefined(MOCK_GRADLE_FILE_RESPONSE.content);
            assert.isTrue(MOCK_GRADLE_FILE_RESPONSE.path.endsWith('.kts'));
        }
    }
]);

export { globalRunner };
