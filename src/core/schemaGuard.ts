import { ArtifactBundle, PlanStep } from "../types/artifacts.js";

export interface SchemaIssue {
  path: string;
  message: string;
}

function isHexString(value: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(value);
}

function isNonNegativeInteger(value: string): boolean {
  return /^\d+$/.test(value);
}

function validateStep(step: PlanStep, i: number): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  if (step.index !== i) {
    issues.push({
      path: `executionPlan.steps[${i}].index`,
      message: `index mismatch: expected ${i}, got ${step.index}`
    });
  }
  if (!step.id) issues.push({ path: `executionPlan.steps[${i}].id`, message: "missing id" });
  if (!step.protocol) issues.push({ path: `executionPlan.steps[${i}].protocol`, message: "missing protocol" });
  if (!step.type) issues.push({ path: `executionPlan.steps[${i}].type`, message: "missing type" });
  if (!step.target || !isHexString(step.target)) {
    issues.push({ path: `executionPlan.steps[${i}].target`, message: "must be hex address" });
  }
  if (!isHexString(step.calldata)) {
    issues.push({ path: `executionPlan.steps[${i}].calldata`, message: "must be hex string" });
  }
  if (!isNonNegativeInteger(step.value)) {
    issues.push({ path: `executionPlan.steps[${i}].value`, message: "must be non-negative integer string" });
  }
  return issues;
}

export function validateArtifactBundle(bundle: ArtifactBundle): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const plan = bundle.executionPlan;

  if (!plan.cycle_id) issues.push({ path: "executionPlan.cycle_id", message: "missing cycle_id" });
  if (!plan.version) issues.push({ path: "executionPlan.version", message: "missing version" });
  if (!plan.network) issues.push({ path: "executionPlan.network", message: "missing network" });
  if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
    issues.push({ path: "executionPlan.steps", message: "must be non-empty array" });
    return issues;
  }

  const seen = new Set<string>();
  plan.steps.forEach((step, i) => {
    issues.push(...validateStep(step, i));
    if (seen.has(step.id)) {
      issues.push({ path: `executionPlan.steps[${i}].id`, message: `duplicate id ${step.id}` });
    }
    seen.add(step.id);
  });

  if (bundle.abiRegistry.network !== plan.network) {
    issues.push({ path: "abiRegistry.network", message: "network mismatch with executionPlan.network" });
  }
  if (bundle.loanRegistry.network !== plan.network) {
    issues.push({ path: "loanRegistry.network", message: "network mismatch with executionPlan.network" });
  }

  return issues;
}
