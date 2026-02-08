#!/usr/bin/env node
import { evaluateArtifacts } from "../core/engine.js";
import { loadArtifacts } from "../core/fsLoader.js";
import { licenseHelpExample, loadLicense, validateLicense } from "../core/license.js";
import { serveReport } from "../gui/reportServer.js";

interface Args {
  executionPlan: string;
  abiRegistry: string;
  loanRegistry: string;
  graphSnapshot?: string;
  cycleMetadata?: string;
  gui: boolean;
  port: number;
  licensePath?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Record<string, string> = {};
  const flags = new Set<string>();

  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags.add(key);
      continue;
    }
    args[key] = next;
    i += 1;
  }

  if (flags.has("help") || !args.executionPlan || !args.abiRegistry || !args.loanRegistry) {
    console.error(
      [
        "Usage: esth --executionPlan <path> --abiRegistry <path> --loanRegistry <path>",
        "            [--graphSnapshot <path>] [--cycleMetadata <path>] [--licensePath <path>]",
        "            [--gui] [--port 4173]",
        "",
        "License key format: holder|plan|signature",
        `Example test key: ${licenseHelpExample("acme", "enterprise")}`
      ].join("\n")
    );
    process.exit(1);
  }

  return {
    executionPlan: args.executionPlan,
    abiRegistry: args.abiRegistry,
    loanRegistry: args.loanRegistry,
    graphSnapshot: args.graphSnapshot,
    cycleMetadata: args.cycleMetadata,
    gui: flags.has("gui"),
    port: args.port ? Number(args.port) : 4173,
    licensePath: args.licensePath
  };
}

async function main(): Promise<void> {
  const cfg = parseArgs(process.argv);
  const licenseRaw = loadLicense(cfg.licensePath);
  if (!licenseRaw) {
    console.error("ESTH license missing. Provide ESTH_LICENSE_KEY or --licensePath <file>.");
    process.exit(3);
  }

  const license = validateLicense(licenseRaw);
  if (!license.valid) {
    console.error(`ESTH license invalid: ${license.reason}`);
    process.exit(4);
  }

  const artifacts = loadArtifacts({
    executionPlanPath: cfg.executionPlan,
    abiRegistryPath: cfg.abiRegistry,
    loanRegistryPath: cfg.loanRegistry,
    graphSnapshotPath: cfg.graphSnapshot,
    cycleMetadataPath: cfg.cycleMetadata
  });

  const verdict = evaluateArtifacts(artifacts);

  const out = {
    status: verdict.status,
    license: {
      holder: license.holder,
      plan: license.plan
    },
    violations: verdict.violations
  };

  console.log(JSON.stringify(out, null, 2));

  if (cfg.gui) {
    process.exitCode = verdict.status === "PASS" ? 0 : 2;
    await serveReport(verdict, artifacts, cfg.port);
    return;
  }

  process.exit(verdict.status === "PASS" ? 0 : 2);
}

main().catch((err: unknown) => {
  console.error("ESTH fatal error:", err);
  process.exit(99);
});
