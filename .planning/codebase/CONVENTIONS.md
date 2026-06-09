# Coding Conventions

**Analysis Date:** 2026-06-09

## Naming Patterns

**Files:**
- Kebab-case for multi-word files: `src/index.ts`, `skills/sales-playbook-matcher/SKILL.md`
- SKILL.md in UPPER_SNAKE for skill index files

**Functions/Variables:**
- camelCase for exported constants: `salesPlaybookArtifactManifest` (`src/index.ts`)

**Types:**
- PascalCase imported from SDK: `SemanticArtifactManifest`

**Packages:**
- Scoped under `@cinatra-ai/` namespace, kebab-case package names

## Code Style

**Formatting:**
- Not detected (no `.prettierrc`, `.editorconfig`, or `biome.json`)

**Linting:**
- Not detected (no `.eslintrc*` or `eslint.config.*`)

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- `noImplicitAny: false` relaxes implicit-any errors
- `verbatimModuleSyntax: true` — import type must use `import type`
- `isolatedModules: true` — each file must be independently compilable
- Target: ES2023, module: ESNext, moduleResolution: bundler

## Import Organization

**Order:**
1. Type imports first (enforced by `verbatimModuleSyntax`)
2. No runtime imports present in the single source file

**Path Aliases:**
- None configured

**Pattern:**
```typescript
import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";
```

## Module Design

**Exports:**
- Named exports only (no default exports observed): `export const salesPlaybookArtifactManifest`
- `package.json` `"main"` and `"types"` both point directly to `./src/index.ts` (source mirror pattern — no build step in standalone mode)

**Barrel Files:**
- `src/index.ts` acts as the single barrel/entry point

## Manifest Duplication Pattern

A critical convention: the artifact manifest is declared in TWO places and must remain in sync:
- TypeScript: `src/index.ts` — `salesPlaybookArtifactManifest` object
- JSON: `package.json` — `cinatra.artifact` block

Both must agree on `mimeTypes`, `matchers`, and `matcherConfidenceThreshold`.

## Dependency Shape Rules

First-party `@cinatra-ai/*` packages MUST be declared as optional `peerDependencies`, never as `dependencies`/`devDependencies`. This is enforced by CI (`ci.yml` classify step). Violation causes CI to exit with code 2.

## Skill Authoring Conventions

Skill prompts (`skills/*/SKILL.md`) follow a structured format:
- YAML front matter: `name`, `description`
- Prose sections: "What IS", "What is NOT", "Confidence guidance", "Output contract"
- Output contract: JSON only, no markdown wrapper
- Confidence bands documented explicitly (0.85–0.95, 0.70–0.84, etc.)

## Comments

**Inline comments:** Used for manifest synchronization reminders and architectural context at the top of `src/index.ts`
- Block comments explain the manifest shape and what the artifact is distinct from

## Error Handling

- Not applicable at source level — this is a manifest/classifier extension with no runtime error paths in `src/index.ts`
- CI shell scripts use `code=$?` capture pattern and branch on exit codes (0, 1, 2) with explicit `echo "::error::"` annotations for GitHub Actions

## Logging

- Not applicable — library package with no application runtime

---

*Convention analysis: 2026-06-09*
