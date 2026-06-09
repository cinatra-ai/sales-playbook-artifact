# Technology Stack

**Analysis Date:** 2026-06-09

## Languages

**Primary:**
- TypeScript — all source in `src/`, targeting ES2023 with strict mode

**Secondary:**
- JSON — manifest schema embedded in `package.json` under the `cinatra` key
- Markdown — skill definition in `skills/sales-playbook-matcher/SKILL.md`

## Runtime

**Environment:**
- Node.js 24 (specified in `.github/workflows/ci.yml` `setup-node` step)

**Package Manager:**
- pnpm via corepack (`corepack enable` in CI)
- Lockfile: not committed (CI runs `--no-frozen-lockfile` for standalone repos)
- `.npmrc`: `auto-install-peers=false`

## Frameworks

**Core:**
- None — this is a Cinatra platform artifact extension; it exports a single typed manifest constant, not an application framework

**Testing:**
- None detected — test step runs `pnpm test --if-present`; no test framework configured

**Build/Dev:**
- TypeScript compiler (`tsc`) — config at `tsconfig.json`, outputs to `dist/`
- No bundler — `moduleResolution: bundler` is a TS resolver hint only; packing is done with `npm pack`

## Key Dependencies

**Critical:**
- `@cinatra-ai/sdk-extensions` — provides the `SemanticArtifactManifest` type used in `src/index.ts`; declared as an optional peer dependency, resolved only inside the Cinatra monorepo

**Infrastructure:**
- None — no runtime dependencies, no devDependencies declared

## Configuration

**TypeScript (`tsconfig.json`):**
- `target`: ES2023
- `module`: ESNext
- `moduleResolution`: bundler
- `jsx`: react-jsx
- `strict`: true, `noImplicitAny`: false
- `isolatedModules`: true
- `declaration`, `declarationMap`, `sourceMap`: true
- `outDir`: `dist/`, `rootDir`: `src/`

**Package manifest (`package.json`):**
- `type`: module (ESM)
- `main` / `types`: `./src/index.ts` (monorepo-resolved; not a compiled path)
- `cinatra.apiVersion`: `cinatra.ai/v1`
- `cinatra.kind`: `artifact`
- `cinatra.artifact.accepts.file.mimeTypes`: `text/markdown`, `text/plain`, `application/pdf`
- `cinatra.artifact.skills.matchers`: `@cinatra-ai/sales-playbook-artifact:sales-playbook-matcher`
- `cinatra.artifact.matcherConfidenceThreshold`: 0.7

**Environment:**
- No `.env` files or environment variable configuration detected in this repo
- Runtime secrets (marketplace vendor token) are org-level GitHub secrets consumed by the reusable release workflow

**Build:**
- `tsconfig.json` — standalone, extends nothing

## Platform Requirements

**Development:**
- Node.js 24+, pnpm (corepack)
- Must be consumed from inside the Cinatra monorepo for type resolution of `@cinatra-ai/sdk-extensions`

**Production:**
- Published to `registry.cinatra.ai` via the Cinatra Marketplace MCP proxy on GitHub Release
- Release flow: `.github/workflows/release.yml` calls reusable workflow `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main`

---

*Stack analysis: 2026-06-09*
