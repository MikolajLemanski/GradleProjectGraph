/**
 * Gradle Parser Tests
 * Tests for extracting project dependencies from Gradle files
 */

import { globalRunner, assert } from '../../js/test-runner.js';
import { 
    extractProjectDependencies, 
    parseGradleFile,
    canonicalizeGraph,
    buildProjectGraph
} from '../../js/gradle-parser.js';

// Sample Gradle file content (decoded from base64 in your sample)
const SAMPLE_BUILD_GRADLE_KTS = `plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidLibrary)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinxSerialization)
}

kotlin {
    jvmToolchain(17)

    androidTarget()

    if (System.getProperty("os.name").lowercase().contains("mac")) {
        listOf(
            iosX64(),
            iosArm64(),
            iosSimulatorArm64()
        ).forEach { iosTarget ->
            iosTarget.binaries.framework {
                baseName = "shared"
                isStatic = true
            }
        }
    }

    sourceSets {
        androidMain.dependencies {
            implementation(libs.androidx.activity.compose)
            implementation(compose.preview)
            implementation(compose.uiTooling)
        }

        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(compose.components.resources)

            implementation(libs.androidx.lifecycle.viewmodel)
            implementation(libs.androidx.lifecycle.runtime.compose)

            implementation(libs.kotlinx.io)
            implementation(libs.kotlinx.serialization.json)

            api(libs.koin.core)
            implementation(libs.koin.compose)
            implementation(libs.koin.composeVM)

            implementation(libs.coroutines.core)

            implementation(libs.mikrosoundfont.midi)
            implementation(libs.mikrosoundfont.soundFont)

            implementation(libs.generative.ai)

            implementation(libs.compottie)
        }

        commonTest.dependencies {
            implementation(libs.kotlin.test)
            implementation(libs.coroutines.test)
        }
    }
}

android {
    namespace = "pl.lemanski.tc"
    compileSdk = libs.versions.android.compileSdk.get().toInt()

    defaultConfig {
        minSdk = libs.versions.android.minSdk.get().toInt()
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
        }
    }

    testOptions {
        unitTests.isReturnDefaultValues = true
    }
}

compose.resources {
    generateResClass = always
}`;

const SAMPLE_SETTINGS_GRADLE_KTS = `rootProject.name = "TinyComposer"
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

pluginManagement {
    repositories {
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        mavenLocal()
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
    }
}

include(":shared")
include(":androidApp")`;

const SAMPLE_WITH_PROJECT_DEPENDENCIES = `plugins {
    id("com.android.application")
    kotlin("android")
}

dependencies {
    implementation(project(":shared"))
    implementation(project(":core:ui"))
    implementation(project(path = ":libs:utils"))
    implementation("androidx.core:core-ktx:1.9.0")
    testImplementation("junit:junit:4.13.2")
}`;

const SAMPLE_WITH_KOTLIN_ACCESSORS = `plugins {
    kotlin("multiplatform")
}

kotlin {
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(projects.shared)
                implementation(projects.core.data)
                implementation(projects.feature.auth)
            }
        }
    }
}`;

// Register test suite
globalRunner.suite('Gradle Parser', [
    {
        name: 'Extract Groovy-style project dependencies',
        fn: () => {
            const result = extractProjectDependencies(
                SAMPLE_WITH_PROJECT_DEPENDENCIES,
                'app/build.gradle'
            );
            
            assert.hasLength(result.dependencies, 3, 'Should find 3 project dependencies');
            assert.equals(result.dependencies[0].projectPath, ':shared');
            assert.equals(result.dependencies[1].projectPath, ':core:ui');
            assert.equals(result.dependencies[2].projectPath, ':libs:utils');
        }
    },
    {
        name: 'Extract Kotlin-style projects accessor dependencies',
        fn: () => {
            const result = extractProjectDependencies(
                SAMPLE_WITH_KOTLIN_ACCESSORS,
                'app/build.gradle.kts'
            );
            
            assert.hasLength(result.dependencies, 3, 'Should find 3 project dependencies');
            assert.equals(result.dependencies[0].projectPath, ':shared');
            assert.equals(result.dependencies[1].projectPath, ':core:data');
            assert.equals(result.dependencies[2].projectPath, ':feature:auth');
            assert.equals(result.dependencies[0].pattern, 'kotlin_projects_accessor');
        }
    },
    {
        name: 'Parse TinyComposer build.gradle.kts (no project deps)',
        fn: () => {
            const result = parseGradleFile(
                SAMPLE_BUILD_GRADLE_KTS,
                'shared/build.gradle.kts'
            );
            
            assert.hasLength(result.dependencies, 0, 'Should find no project dependencies');
            assert.greaterThan(result.warnings.length, 0, 'Should have warnings about external deps');
        }
    },
    {
        name: 'Parse settings.gradle.kts include statements',
        fn: () => {
            const result = parseGradleFile(
                SAMPLE_SETTINGS_GRADLE_KTS,
                'settings.gradle.kts'
            );
            
            // Settings file includes are handled differently
            // This test verifies no false positives
            assert.isDefined(result.dependencies);
        }
    },
    {
        name: 'Canonicalize graph - deduplicate nodes',
        fn: () => {
            const nodes = [
                { projectPath: ':app' },
                { projectPath: ':shared' },
                { projectPath: ':app' }, // duplicate
                { projectPath: ':core' }
            ];
            const edges = [];
            
            const result = canonicalizeGraph(nodes, edges);
            
            assert.hasLength(result.nodes, 3, 'Should deduplicate nodes');
            assert.equals(result.nodes[0].projectPath, ':app');
            assert.equals(result.nodes[1].projectPath, ':core');
            assert.equals(result.nodes[2].projectPath, ':shared');
        }
    },
    {
        name: 'Canonicalize graph - sort nodes alphabetically',
        fn: () => {
            const nodes = [
                { projectPath: ':z-last' },
                { projectPath: ':a-first' },
                { projectPath: ':m-middle' }
            ];
            const edges = [];
            
            const result = canonicalizeGraph(nodes, edges);
            
            assert.equals(result.nodes[0].projectPath, ':a-first');
            assert.equals(result.nodes[1].projectPath, ':m-middle');
            assert.equals(result.nodes[2].projectPath, ':z-last');
        }
    },
    {
        name: 'Canonicalize graph - remove self-loops',
        fn: () => {
            const nodes = [
                { projectPath: ':app' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':app' }, // self-loop
                { fromProjectPath: ':app', toProjectPath: ':shared' }
            ];
            
            const result = canonicalizeGraph(nodes, edges);
            
            assert.hasLength(result.edges, 1, 'Should remove self-loop');
            assert.equals(result.edges[0].toProjectPath, ':shared');
        }
    },
    {
        name: 'Canonicalize graph - deduplicate edges',
        fn: () => {
            const nodes = [
                { projectPath: ':app' },
                { projectPath: ':shared' }
            ];
            const edges = [
                { fromProjectPath: ':app', toProjectPath: ':shared' },
                { fromProjectPath: ':app', toProjectPath: ':shared' } // duplicate
            ];
            
            const result = canonicalizeGraph(nodes, edges);
            
            assert.hasLength(result.edges, 1, 'Should deduplicate edges');
        }
    },
    {
        name: 'Build project graph from parsed files',
        fn: () => {
            const parsedFiles = [
                {
                    path: 'app/build.gradle',
                    dependencies: [
                        { projectPath: ':shared' },
                        { projectPath: ':core' }
                    ],
                    warnings: []
                },
                {
                    path: 'core/build.gradle',
                    dependencies: [
                        { projectPath: ':utils' }
                    ],
                    warnings: []
                }
            ];
            
            const result = buildProjectGraph(parsedFiles);
            
            assert.greaterThan(result.nodes.length, 0, 'Should have nodes');
            assert.greaterThan(result.edges.length, 0, 'Should have edges');
            
            // Should include both source and target projects
            const projectPaths = result.nodes.map(n => n.projectPath);
            assert.contains(projectPaths, ':shared');
            assert.contains(projectPaths, ':core');
            assert.contains(projectPaths, ':utils');
        }
    },
    {
        name: 'Handle empty dependencies',
        fn: () => {
            const result = extractProjectDependencies('', 'build.gradle');
            
            assert.hasLength(result.dependencies, 0);
            assert.isDefined(result.warnings);
        }
    },
    {
        name: 'Detect external Maven dependencies',
        fn: () => {
            const content = `
                dependencies {
                    implementation("androidx.core:core-ktx:1.9.0")
                    implementation("junit:junit:4.13.2")
                }
            `;
            
            const result = extractProjectDependencies(content, 'app/build.gradle');
            
            assert.hasLength(result.dependencies, 0, 'Should not include external deps');
            assert.greaterThan(result.warnings.length, 0, 'Should warn about external deps');
        }
    }
]);

export { globalRunner };
