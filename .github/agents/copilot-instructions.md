# GradleProjectGraph Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-19

## Active Technologies
- Plain JavaScript (ECMAScript 2020+), HTML5, CSS3 + None (vanilla JS). Uses existing `js/github-client.js` and `js/input-page.js` extension points. (001-add-github-token)
- Session memory (in-memory JS object). No persistence to disk or server by default; optional `sessionStorage` use is possible but currently disabled per spec. (001-add-github-token)

- JavaScript (ES2020+) running in modern browsers + Mermaid.js (graph rendering), GitHub REST API (public repository metadata/contents) (001-gradle-graph-viewer)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (ES2020+) running in modern browsers: Follow standard conventions

## Recent Changes
- 001-add-github-token: Added Plain JavaScript (ECMAScript 2020+), HTML5, CSS3 + None (vanilla JS). Uses existing `js/github-client.js` and `js/input-page.js` extension points.

- 001-gradle-graph-viewer: Added JavaScript (ES2020+) running in modern browsers + Mermaid.js (graph rendering), GitHub REST API (public repository metadata/contents)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
