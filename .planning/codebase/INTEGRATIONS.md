# External Integrations

**Analysis Date:** 2026-06-09

## APIs & External Services

**Cinatra Platform:**
- Cinatra Marketplace MCP Proxy — artifact submission and promotion on release
  - SDK/Client: `@cinatra-ai/sdk-extensions` (optional peer, monorepo-resolved)
  - Auth: `CINATRA_MARKETPLACE_VENDOR_TOKEN` org-level GitHub secret (consumed by the reusable release workflow; never referenced in this repo's own code)

## Data Storage

**Databases:**
- Not applicable — this repo is a Cinatra artifact extension definition, not a service

**File Storage:**
- Not applicable

**Caching:**
- Not applicable

## Authentication & Identity

**Auth Provider:**
- Not applicable at the extension level; marketplace authentication is handled entirely by the reusable GitHub Actions workflow `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main` using GitHub OIDC (`id-token: write`) for build-provenance attestation and the org `CINATRA_MARKETPLACE_VENDOR_TOKEN` secret for submission

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- CI job stdout only (GitHub Actions); no application-level logging

## CI/CD & Deployment

**Hosting:**
- Cinatra Marketplace / `registry.cinatra.ai`

**CI Pipeline:**
- GitHub Actions
  - `.github/workflows/ci.yml` — runs on push/PR to `main`; validates first-party dep shape, installs (standalone only), typechecks, tests, and dry-run packs
  - `.github/workflows/release.yml` — triggers on GitHub Release publish or manual `workflow_dispatch` against a version tag; delegates all build/gate/submit logic to the org-level reusable workflow

## Environment Configuration

**Required env vars:**
- None declared in the extension repo itself
- `CINATRA_MARKETPLACE_VENDOR_TOKEN` — org secret required by the release workflow (GitHub Actions only, not in source)

**Secrets location:**
- GitHub org secrets (not committed to this repo)

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable — artifact submission is initiated via GitHub Actions, not an outbound webhook from this repo

---

*Integration audit: 2026-06-09*
