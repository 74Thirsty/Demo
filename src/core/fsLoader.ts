import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AbiRegistrySnapshot,
  ArtifactBundle,
  CycleMetadata,
  ExecutionPlan,
  GraphSnapshot,
  LoanRegistrySnapshot
} from "../types/artifacts.js";

function loadJson<T>(path: string): T {
  const full = resolve(path);
  const raw = readFileSync(full, "utf8");
  return JSON.parse(raw) as T;
}

export interface LoadConfig {
  executionPlanPath: string;
  abiRegistryPath: string;
  loanRegistryPath: string;
  graphSnapshotPath?: string;
  cycleMetadataPath?: string;
}

export function loadArtifacts(cfg: LoadConfig): ArtifactBundle {
  const executionPlan = loadJson<ExecutionPlan>(cfg.executionPlanPath);
  const abiRegistry = loadJson<AbiRegistrySnapshot>(cfg.abiRegistryPath);
  const loanRegistry = loadJson<LoanRegistrySnapshot>(cfg.loanRegistryPath);

  const graphSnapshot = cfg.graphSnapshotPath
    ? loadJson<GraphSnapshot>(cfg.graphSnapshotPath)
    : undefined;

  const cycleMetadata = cfg.cycleMetadataPath
    ? loadJson<CycleMetadata>(cfg.cycleMetadataPath)
    : undefined;

  return {
    executionPlan,
    abiRegistry,
    loanRegistry,
    graphSnapshot,
    cycleMetadata
  };
}
