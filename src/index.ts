import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";

// `@cinatra-ai/sales-playbook-artifact` declares the sales-playbook artifact
// extension. A semantic work product describing the sales motion the team
// executes — discovery / qualification frameworks, call scripts, objection
// handling, stage-gate criteria, and proposal templates. Distinct from the
// marketing strategy (channel + messaging plan) and ICP (the audience itself).
//
// Manifest shape: bytes-only matcher, no connectorRef / templates /
// agentDependencies. Mirrored in package.json `cinatra.artifact`.
export const salesPlaybookArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["text/markdown", "text/plain", "application/pdf"],
    },
  },
  skills: {
    matchers: ["@cinatra-ai/sales-playbook-artifact:sales-playbook-matcher"],
  },
  matcherConfidenceThreshold: 0.7,
};
