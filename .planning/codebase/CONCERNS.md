# Codebase Concerns

**Analysis Date:** 2026-06-09

## Tech Debt

**Wildcard peer dependency version:**
- Issue: `@cinatra-ai/sdk-extensions` is declared as a peer with version `"*"`, meaning any version is accepted. This provides no compatibility guarantee and could allow incompatible SDK versions to be used silently.
- Files: `package.json`
- Impact: Breaking SDK changes will not be caught at install time; runtime failures only.
- Fix approach: Pin to a minimum semver range (e.g. `">=0.1.0"`) once the SDK stabilizes.

**`main` and `types` point to raw TypeScript source:**
- Issue: `package.json` sets `"main": "./src/index.ts"` and `"types": "./src/index.ts"`. This is unconventional — published packages normally point to compiled `dist/` output. The current setup only works because the monorepo consumes the raw source directly.
- Files: `package.json`
- Impact: If the package were ever published standalone (outside the monorepo workspace), consumers would receive TypeScript source rather than compiled JavaScript, requiring `ts-node` or similar.
- Fix approach: Add a build step and update `main`/`types` to `"./dist/index.js"` / `"./dist/index.d.ts"` before marketplace publication.

**`noImplicitAny: false` contradicts `strict: true`:**
- Issue: `tsconfig.json` enables `"strict": true` but then overrides `"noImplicitAny": false`. This silently re-allows implicit `any` types, weakening the strictness guarantee.
- Files: `tsconfig.json`
- Impact: Type safety holes can creep in without compiler errors.
- Fix approach: Remove the `noImplicitAny: false` override to honour full strict mode.

**`jsx: "react-jsx"` configured for a non-UI package:**
- Issue: `tsconfig.json` includes `"jsx": "react-jsx"` and `"lib": ["DOM", "DOM.Iterable"]` even though this artifact extension contains no React components or browser code. This is noise copied from a template and may cause confusion.
- Files: `tsconfig.json`
- Impact: Misleads future contributors; introduces unnecessary DOM type surface area.
- Fix approach: Remove `jsx` and DOM lib entries; keep only `ES2023`.

## Known Bugs

Not detected — the codebase is a minimal manifest declaration with no runtime logic beyond a typed constant export.

## Security Considerations

**Release workflow inherits all org secrets:**
- Risk: `secrets: inherit` in `release.yml` passes every organization-level secret (including `CINATRA_MARKETPLACE_VENDOR_TOKEN`) to the reusable workflow. If the reusable workflow at `cinatra-ai/.github` is ever compromised or misconfigured, all inherited secrets are exposed.
- Files: `.github/workflows/release.yml`
- Current mitigation: The reusable workflow is pinned to `@main` (not a SHA), so any commit on that branch takes effect immediately.
- Recommendations: Pin the reusable workflow to a specific commit SHA rather than `@main` to prevent supply-chain drift. Audit which secrets `secrets: inherit` actually exposes.

**Reusable workflow pinned to `@main` (floating ref):**
- Risk: `uses: cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main` uses a mutable branch ref. A malicious or accidental push to `main` in the `.github` repo changes the release pipeline immediately.
- Files: `.github/workflows/release.yml`
- Current mitigation: None — the ref is fully mutable.
- Recommendations: Pin to a commit SHA (e.g. `@abc1234`) and update deliberately.

**.npmrc present — check for auth tokens:**
- The `.npmrc` file exists and contains `auto-install-peers=false`. No auth tokens were detected in its content. This is acceptable; note that any future registry auth tokens added to `.npmrc` must not be committed.
- Files: `.npmrc`

## Performance Bottlenecks

Not applicable — this package exports a single static manifest constant. There is no runtime logic, I/O, or computation.

## Fragile Areas

**CI skips install, typecheck, and tests for source-mirror repos:**
- Files: `.github/workflows/ci.yml`
- Why fragile: The CI workflow detects "source mirror" status (presence of first-party `@cinatra-ai/*` optional peers) and skips `pnpm install`, `tsc`, and tests entirely. This means CI passes green on this repo without actually compiling or testing anything. Regressions in `src/index.ts` are only caught when the parent monorepo runs its own checks.
- Safe modification: Any change to `src/index.ts` or `tsconfig.json` must be validated inside the monorepo workspace, not in this repo's standalone CI.
- Test coverage: Zero — no test files exist in this repo.

**Manifest duplication between `src/index.ts` and `package.json`:**
- Files: `src/index.ts`, `package.json`
- Why fragile: The artifact manifest shape (accepted MIME types, matcher skill reference, confidence threshold `0.7`) is declared twice — once as a TypeScript object in `src/index.ts` and once under `cinatra.artifact` in `package.json`. These two sources can drift out of sync silently; no validation enforces consistency.
- Safe modification: Treat `package.json` as the source of truth for the runtime platform, and `src/index.ts` as the SDK-typed representation. Any change to one must be mirrored to the other.
- Test coverage: None.

## Scaling Limits

Not applicable — static manifest package with no runtime load characteristics.

## Dependencies at Risk

**`@cinatra-ai/sdk-extensions` — internal-only, unversioned peer:**
- Risk: This dependency is host-internal and published to no public registry. It can only be resolved inside the Cinatra monorepo workspace. If the SDK interface changes (e.g. `SemanticArtifactManifest` type shape), this package silently breaks until the monorepo re-checks it.
- Impact: `src/index.ts` fails to typecheck; the exported manifest type becomes invalid.
- Migration plan: No external alternative. Stay aligned with monorepo SDK version and update `src/index.ts` whenever `SemanticArtifactManifest` changes.

## Missing Critical Features

**No tests of any kind:**
- Problem: There are zero test files in the repository (`*.test.*`, `*.spec.*` — none found). The SKILL.md classifier prompt has no automated validation that its confidence thresholds and positive/negative example discrimination are correct.
- Blocks: Cannot verify that the `sales-playbook-matcher` skill correctly distinguishes sales playbooks from marketing strategies, ICPs, competitive analyses, etc.

**No schema validation for `cinatra.artifact` in `package.json`:**
- Problem: The `cinatra` block in `package.json` is free-form JSON with no JSON Schema validation in CI. The `kind-gates` job explicitly states "No kind-specific gate for this extension kind." This means a malformed manifest is only caught at marketplace submission time.
- Blocks: Early detection of manifest regressions during development.

## Test Coverage Gaps

**Matcher skill prompt — no test coverage:**
- What's not tested: The `sales-playbook-matcher` SKILL.md classifier logic — boundary cases between sales playbook and adjacent artifact types (ICP, marketing strategy, competitive analysis), the confidence band thresholds (0.70–0.84 vs 0.85–0.95), and the "battlecard-only" edge case.
- Files: `skills/sales-playbook-matcher/SKILL.md`
- Risk: Mis-classification of attached documents goes undetected until end-user reports.
- Priority: Medium

**TypeScript manifest export — no test coverage:**
- What's not tested: The `salesPlaybookArtifactManifest` export in `src/index.ts` is never imported or asserted against in any test. A typo in a MIME type string or skill reference would not be caught.
- Files: `src/index.ts`
- Risk: Silent manifest regression published to the marketplace.
- Priority: Medium

---

*Concerns audit: 2026-06-09*
