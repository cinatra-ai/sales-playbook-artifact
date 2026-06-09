# Codebase Structure

**Analysis Date:** 2026-06-09

## Directory Layout

```
sales-playbook-artifact/
├── src/
│   └── index.ts              # Sole TypeScript source — exports SemanticArtifactManifest constant
├── skills/
│   └── sales-playbook-matcher/
│       └── SKILL.md          # LLM classifier prompt for sales playbook detection
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI: dependency-shape gate, typecheck, pack dry-run, kind gates
│       └── release.yml       # Release workflow
├── .npmrc                    # npm/pnpm registry config
├── package.json              # Extension metadata, cinatra registration block, peer deps
├── tsconfig.json             # Standalone strict TypeScript config (targets src/, outputs dist/)
├── LICENSE                   # Apache-2.0
└── README.md                 # Project documentation
```

## Directory Purposes

**`src/`:**
- Purpose: TypeScript source for the artifact extension
- Contains: A single `index.ts` exporting the typed manifest constant
- Key files: `src/index.ts`

**`skills/`:**
- Purpose: Cinatra skill definitions — LLM prompt files executed by the platform
- Contains: One subdirectory per skill, each with a `SKILL.md` prompt file
- Key files: `skills/sales-playbook-matcher/SKILL.md`

**`skills/sales-playbook-matcher/`:**
- Purpose: The semantic classifier skill that determines if an attached file is a Sales Playbook
- Contains: `SKILL.md` with front-matter (`name`, `description`) and structured LLM prompt
- Key files: `skills/sales-playbook-matcher/SKILL.md`

**`.github/workflows/`:**
- Purpose: CI/CD pipeline definitions
- Contains: `ci.yml` (baseline + kind-specific gates), `release.yml` (release automation)
- Key files: `.github/workflows/ci.yml`

## Key File Locations

**Entry Points:**
- `src/index.ts`: TypeScript manifest export; `package.json` `main` and `types` both point here

**Configuration:**
- `package.json`: npm metadata + `cinatra` registration block (kind, artifact shape, matchers, threshold)
- `tsconfig.json`: TypeScript compiler config; `rootDir: src`, `outDir: dist`, strict mode, ESNext modules
- `.npmrc`: Registry configuration for pnpm/npm

**Core Logic:**
- `src/index.ts`: Manifest constant declaration
- `skills/sales-playbook-matcher/SKILL.md`: Classifier prompt (positive/negative criteria, confidence bands, JSON output contract)

**CI:**
- `.github/workflows/ci.yml`: Dependency-shape validation, conditional typecheck/test (skipped for source mirrors), `npm pack --dry-run`, kind-specific gates

## Naming Conventions

**Files:**
- TypeScript sources: `camelCase.ts` (e.g., `index.ts`)
- Skill prompts: `SKILL.md` (always uppercase, always at the root of the skill subdirectory)
- Workflows: `kebab-case.yml`

**Directories:**
- Skills: `kebab-case` matching the skill's registered name (e.g., `sales-playbook-matcher`)
- Top-level: lowercase or standard tooling names (`src`, `skills`, `.github`)

**Exported identifiers:**
- Manifest constant: `<name>ArtifactManifest` camelCase (e.g., `salesPlaybookArtifactManifest`)

## Where to Add New Code

**New classifier skill:**
- Create `skills/<skill-name>/SKILL.md` following the front-matter + prompt + JSON output contract pattern in `skills/sales-playbook-matcher/SKILL.md`
- Register the skill name in `src/index.ts` under `skills.matchers` array
- Mirror the registration in `package.json` under `cinatra.artifact.skills.matchers`

**New artifact manifest field:**
- Edit `src/index.ts` to update the `salesPlaybookArtifactManifest` constant
- Mirror the change in `package.json` under `cinatra.artifact` to keep both representations in sync

**New TypeScript utility:**
- Add to `src/` — keep files focused; this extension is intentionally minimal

## Special Directories

**`dist/`:**
- Purpose: TypeScript compiler output (declarations + source maps)
- Generated: Yes (by `tsc`)
- Committed: No (not present; generated at build time in monorepo)

**`.planning/`:**
- Purpose: GSD planning documents (codebase maps, phase plans)
- Generated: Yes (by GSD tooling)
- Committed: Per project convention

---

*Structure analysis: 2026-06-09*
