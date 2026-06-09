<!-- refreshed: 2026-06-09 -->
# Architecture

**Analysis Date:** 2026-06-09

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│              Cinatra Monorepo (host)                         │
│  Resolves @cinatra-ai/sdk-extensions, runs typecheck/tests   │
└─────────────────────────┬───────────────────────────────────┘
                          │ optional peerDependency
                          ▼
┌─────────────────────────────────────────────────────────────┐
│          @cinatra-ai/sales-playbook-artifact                 │
│              (source mirror / extracted extension)           │
│                                                              │
│   src/index.ts                                               │
│   └─ salesPlaybookArtifactManifest: SemanticArtifactManifest│
│      ├── accepts: { file: { mimeTypes: [...] } }            │
│      ├── skills.matchers: [sales-playbook-matcher]          │
│      └── matcherConfidenceThreshold: 0.7                    │
└─────────────────────────┬───────────────────────────────────┘
                          │ references by name
                          ▼
┌─────────────────────────────────────────────────────────────┐
│       skills/sales-playbook-matcher/SKILL.md                 │
│       (LLM prompt — semantic classifier)                     │
│       Output: { matches: bool, confidence: 0..1, rationale } │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Artifact manifest | Declares the `sales-playbook` artifact extension: accepted MIME types, linked skill matchers, confidence threshold | `src/index.ts` |
| Skill matcher prompt | LLM prompt that classifies an attached resource as a Sales Playbook with a confidence score and rationale | `skills/sales-playbook-matcher/SKILL.md` |
| Package metadata | Cinatra extension registration (`cinatra.kind=artifact`), peer dependency shape, npm entry points | `package.json` |
| CI pipeline | Validates dependency shape, conditionally typechecks/tests (skipped for source mirrors), runs `npm pack --dry-run`, and runs kind-specific gates | `.github/workflows/ci.yml` |

## Pattern Overview

**Overall:** Cinatra Semantic Artifact Extension (Source Mirror pattern)

**Key Characteristics:**
- This repo is a *source mirror* — it is extracted from the Cinatra monorepo and is not standalone-installable or standalone-typecheckable. The monorepo resolves `@cinatra-ai/sdk-extensions` and runs typecheck/tests.
- The sole TypeScript file exports a typed manifest constant; there is no runtime logic, no server, and no data flow beyond manifest declaration.
- The classifier logic lives entirely in a SKILL.md prompt file consumed by the Cinatra platform at runtime; no code implements the classification.
- The `cinatra` block in `package.json` mirrors the TypeScript manifest exactly and is the canonical machine-readable registration consumed by the Cinatra platform.

## Layers

**Manifest Declaration Layer:**
- Purpose: Declares what file types this artifact accepts and which skill matchers classify them
- Location: `src/index.ts`
- Contains: Single exported `SemanticArtifactManifest` constant
- Depends on: `@cinatra-ai/sdk-extensions` type (optional peer, not bundled)
- Used by: Cinatra monorepo / platform at extension-registration time

**Skill Layer:**
- Purpose: Provides the LLM prompt that performs semantic classification
- Location: `skills/sales-playbook-matcher/SKILL.md`
- Contains: Classifier prompt with positive/negative examples, confidence guidance, and JSON output contract
- Depends on: Nothing (plain markdown, platform-executed)
- Used by: Cinatra platform when a user attaches a file to a sales-playbook artifact slot

**Package Registration Layer:**
- Purpose: Machine-readable extension metadata for the Cinatra registry/platform
- Location: `package.json` (`cinatra` key)
- Contains: `apiVersion`, `kind: artifact`, accepted MIME types, matcher references, confidence threshold
- Depends on: Nothing at runtime
- Used by: Cinatra platform extension loader

## Data Flow

### Artifact Classification Path

1. User attaches a file (`.md`, `.txt`, `.pdf`) to a Cinatra artifact slot
2. Platform reads `package.json#cinatra.artifact` to determine accepted MIME types and matcher skill
3. Platform invokes `skills/sales-playbook-matcher/SKILL.md` prompt with file content
4. LLM returns `{ matches: boolean, confidence: number, rationale: string }`
5. Platform compares `confidence` against `matcherConfidenceThreshold: 0.7`; accepts or rejects the file

### Extension Registration Path

1. Cinatra monorepo clones/references this repo as a workspace package
2. Monorepo reads `src/index.ts` export for typed manifest usage in host code
3. Platform reads `package.json#cinatra` block for registry metadata

**State Management:**
- No runtime state. The extension is purely declarative (manifest + prompt).

## Key Abstractions

**SemanticArtifactManifest:**
- Purpose: TypeScript type from `@cinatra-ai/sdk-extensions` that enforces the shape of the manifest object
- Examples: `src/index.ts`
- Pattern: Single typed constant export; no class, no function

**SKILL.md Classifier:**
- Purpose: Zero-code LLM skill — a markdown prompt file that the Cinatra platform executes against attached file bytes
- Examples: `skills/sales-playbook-matcher/SKILL.md`
- Pattern: Front-matter (`name`, `description`) + structured prompt with positive/negative criteria + JSON output contract

## Entry Points

**TypeScript Entry Point:**
- Location: `src/index.ts`
- Triggers: Import by Cinatra monorepo host code
- Responsibilities: Exports `salesPlaybookArtifactManifest` constant for typed usage

**Package Entry Point:**
- Location: `package.json` `main` / `types` both point to `./src/index.ts`
- Triggers: npm/pnpm resolution in monorepo workspace
- Responsibilities: Exposes the manifest type and value to consumers

## Architectural Constraints

- **Standalone build:** Not standalone-buildable. `@cinatra-ai/sdk-extensions` is an optional peer that exists only in the Cinatra monorepo. CI skips install/typecheck/test for source mirrors.
- **Global state:** None. No module-level mutable state.
- **Circular imports:** Not applicable (single source file).
- **Manifest parity:** The `cinatra.artifact` block in `package.json` must stay in sync with the `salesPlaybookArtifactManifest` export in `src/index.ts`. These are the same data in two representations (typed TS constant vs. raw JSON for the platform).
- **Confidence threshold:** `matcherConfidenceThreshold: 0.7` is defined in both `src/index.ts` and `package.json`. Any change must be applied to both.

## Anti-Patterns

### Promoting first-party deps to dependencies/devDependencies

**What happens:** Adding `@cinatra-ai/*` packages to `dependencies` or `devDependencies` instead of optional `peerDependencies`.
**Why it's wrong:** The CI gate (`ci.yml` "Classify repo" step) explicitly fails with exit 2 if first-party packages appear outside optional peerDependencies. These packages are not on any public registry and cannot be resolved standalone.
**Do this instead:** Declare any new `@cinatra-ai/*` dep under `peerDependencies` and add `peerDependenciesMeta.<pkg>.optional: true` in `package.json`.

### Adding runtime logic to the manifest file

**What happens:** Adding functions, conditionals, or class logic to `src/index.ts` beyond the manifest constant.
**Why it's wrong:** This is a declarative extension; all intelligence belongs in `skills/*/SKILL.md` prompts executed by the platform. Runtime code here would not be reachable.
**Do this instead:** Add or extend a `SKILL.md` file under `skills/<skill-name>/`.

## Error Handling

**Strategy:** Not applicable — no runtime code.

**Patterns:**
- CI validation catches shape regressions (wrong dep type, missing `peerDependenciesMeta.optional`) at PR time.
- `npm pack --dry-run` validates publish payload without resolving peers.

## Cross-Cutting Concerns

**Logging:** Not applicable (no runtime code).
**Validation:** CI-enforced via inline Node.js script in `.github/workflows/ci.yml`.
**Authentication:** Not applicable.

---

*Architecture analysis: 2026-06-09*
