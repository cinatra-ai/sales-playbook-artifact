# Testing Patterns

**Analysis Date:** 2026-06-09

## Test Framework

**Runner:**
- Not configured in this repo directly
- CI runs `corepack pnpm test --if-present` — no `test` script is defined in `package.json`, so no tests execute in standalone mode
- The monorepo (cinatra) owns and runs tests for this source-mirror extension

**Assertion Library:**
- Not applicable (no test files present)

**Run Commands:**
```bash
pnpm test          # Would run if a test script existed; currently a no-op (--if-present)
```

## Test File Organization

**Location:**
- No test files detected under `src/` or project root
- No `*.test.ts`, `*.spec.ts`, or `__tests__/` directories exist

**Naming:**
- Not applicable

## Test Structure

**Suite Organization:**
- Not applicable — tests for this extension live in the cinatra monorepo workspace, not in this extracted repo

## Mocking

**Framework:**
- Not applicable

## Fixtures and Factories

**Test Data:**
- Not applicable

## Coverage

**Requirements:**
- Not enforced in this repo — no coverage configuration detected
- Coverage is managed by the cinatra monorepo CI

**View Coverage:**
- Not applicable standalone

## Test Types

**Unit Tests:**
- Not present in this repo; handled by monorepo

**Integration Tests:**
- Not present in this repo; handled by monorepo

**E2E Tests:**
- Not applicable

## CI Validation (Substitute for Tests)

Since this is a source-mirror extension (declares `@cinatra-ai/sdk-extensions` as an optional peer), the CI pipeline at `.github/workflows/ci.yml` substitutes structured validation for runtime tests:

**Dependency Shape Gate (`build` job, "Classify repo" step):**
- Fails (exit 2) if any `@cinatra-ai/*` package appears in `dependencies`, `devDependencies`, or `optionalDependencies`
- Fails if any first-party peer is missing `peerDependenciesMeta[pkg].optional = true`
- Enforces the source-mirror contract

**Pack Dry-Run:**
- `npm pack --dry-run` validates package shape and publish payload without resolving peers
- Catches missing fields, bad `main`/`types` pointers, or unexpected file inclusions

**Kind Gate (`kind-gates` job):**
- For `artifact` kind: no additional gate (placeholder step only)
- For `workflow`/`agent` kinds: `extension-kind-gate.mjs` would run (not applicable here)

**Typecheck:**
- Skipped for this repo because it declares host-internal `@cinatra-ai/*` peers (first_party=1)
- The cinatra monorepo performs typecheck when it integrates this source mirror

## Notes on Testing Philosophy

This extension follows the cinatra source-mirror pattern: the extracted repo is a content/manifest package. Behavioral correctness (does the matcher classify documents correctly?) is validated by the monorepo's integration test suite, not by standalone unit tests here. The standalone CI focuses on structural/shape correctness only.

---

*Testing analysis: 2026-06-09*
