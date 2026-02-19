/**
 * Test Runner Framework
 * Simple browser-based test runner for health checks
 */

export class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: [],
            duration: 0
        };
    }

    // Register a test
    test(name, fn) {
        this.tests.push({ name, fn });
    }

    // Register a test suite
    suite(suiteName, suiteTests) {
        suiteTests.forEach(test => {
            this.test(`${suiteName} :: ${test.name}`, test.fn);
        });
    }

    // Run all tests
    async runAll() {
        const startTime = performance.now();
        this.results = {
            total: this.tests.length,
            passed: 0,
            failed: 0,
            errors: [],
            duration: 0,
            details: []
        };

        for (const test of this.tests) {
            try {
                const testStart = performance.now();
                await test.fn();
                const testDuration = performance.now() - testStart;
                
                this.results.passed++;
                this.results.details.push({
                    name: test.name,
                    status: 'passed',
                    duration: testDuration
                });
            } catch (error) {
                this.results.failed++;
                this.results.errors.push({
                    test: test.name,
                    error: error.message || String(error),
                    stack: error.stack
                });
                this.results.details.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message || String(error)
                });
            }
        }

        this.results.duration = performance.now() - startTime;
        return this.results;
    }

    // Clear all tests
    clear() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: [],
            duration: 0
        };
    }
}

// Assertion helpers
export const assert = {
    equals(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(
                message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
            );
        }
    },

    deepEquals(actual, expected, message = '') {
        const actualJson = JSON.stringify(actual);
        const expectedJson = JSON.stringify(expected);
        if (actualJson !== expectedJson) {
            throw new Error(
                message || `Expected ${expectedJson} but got ${actualJson}`
            );
        }
    },

    isTrue(value, message = '') {
        if (value !== true) {
            throw new Error(message || `Expected true but got ${value}`);
        }
    },

    isFalse(value, message = '') {
        if (value !== false) {
            throw new Error(message || `Expected false but got ${value}`);
        }
    },

    isNull(value, message = '') {
        if (value !== null) {
            throw new Error(message || `Expected null but got ${value}`);
        }
    },

    isNotNull(value, message = '') {
        if (value === null) {
            throw new Error(message || 'Expected non-null value');
        }
    },

    isDefined(value, message = '') {
        if (value === undefined) {
            throw new Error(message || 'Expected defined value');
        }
    },

    contains(array, value, message = '') {
        if (!Array.isArray(array)) {
            throw new Error('First argument must be an array');
        }
        if (!array.includes(value)) {
            throw new Error(
                message || `Expected array to contain ${JSON.stringify(value)}`
            );
        }
    },

    hasLength(array, length, message = '') {
        if (!Array.isArray(array) && typeof array !== 'string') {
            throw new Error('First argument must be an array or string');
        }
        if (array.length !== length) {
            throw new Error(
                message || `Expected length ${length} but got ${array.length}`
            );
        }
    },

    throws(fn, expectedError, message = '') {
        try {
            fn();
            throw new Error(message || 'Expected function to throw an error');
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(
                    `Expected error containing "${expectedError}" but got "${error.message}"`
                );
            }
        }
    },

    async throwsAsync(fn, expectedError, message = '') {
        try {
            await fn();
            throw new Error(message || 'Expected async function to throw an error');
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(
                    `Expected error containing "${expectedError}" but got "${error.message}"`
                );
            }
        }
    },

    matches(value, pattern, message = '') {
        if (typeof value !== 'string') {
            throw new Error('Value must be a string');
        }
        if (!pattern.test(value)) {
            throw new Error(
                message || `Expected "${value}" to match pattern ${pattern}`
            );
        }
    },

    greaterThan(actual, expected, message = '') {
        if (actual <= expected) {
            throw new Error(
                message || `Expected ${actual} to be greater than ${expected}`
            );
        }
    },

    lessThan(actual, expected, message = '') {
        if (actual >= expected) {
            throw new Error(
                message || `Expected ${actual} to be less than ${expected}`
            );
        }
    }
};

// Create global test runner instance
export const globalRunner = new TestRunner();
