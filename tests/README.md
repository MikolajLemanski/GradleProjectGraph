# Test Suite

Browser-based health check tests for the Gradle Project Graph Viewer.

## Running Tests

1. Open `index.html` in a browser
2. Click the **"🔍 Run Tests"** button in the Health Check section
3. View results inline on the page

## Test Structure

- **`/tests/parser/`** - Unit tests for Gradle file parsing
- **`/tests/integration/`** - Integration tests for GitHub client and URL handling
- **`/js/test-runner.js`** - Lightweight test framework
- **`/js/test-orchestrator.js`** - Test suite orchestrator and UI integration

## Test Coverage

### Parser Tests
- ✓ Extract Groovy-style project dependencies
- ✓ Extract Kotlin-style projects accessor dependencies
- ✓ Parse build.gradle.kts files
- ✓ Parse settings.gradle.kts files
- ✓ Canonicalize graph (deduplicate, sort)
- ✓ Build project graph from parsed files
- ✓ Detect external Maven dependencies

### GitHub Client Tests
- ✓ Normalize GitHub URLs
- ✓ Handle branch references
- ✓ Validate mock API responses
- ✓ Error handling

## Adding New Tests

```javascript
import { globalRunner, assert } from '../../js/test-runner.js';

globalRunner.suite('My Suite', [
    {
        name: 'My test',
        fn: () => {
            assert.equals(1 + 1, 2);
        }
    }
]);
```

## Assertions Available

- `assert.equals(actual, expected)`
- `assert.deepEquals(actual, expected)`
- `assert.isTrue(value)`
- `assert.isFalse(value)`
- `assert.isNull(value)`
- `assert.isDefined(value)`
- `assert.contains(array, value)`
- `assert.hasLength(array, length)`
- `assert.greaterThan(actual, expected)`
- `assert.throws(fn, expectedError)`

## No Build Required

All tests run natively in the browser using ES6 modules. No npm, webpack, or build tools needed.
