import { ArtifactBundle } from "../types/artifacts.js";
import { Verdict, RuleViolation } from "../types/verdict.js";
import { allRules } from "../rules/index.js";
import { PlanIndex } from "./planIndex.js";
import { validateArtifactBundle } from "./schemaGuard.js";

export function evaluateArtifacts(bundle: ArtifactBundle): Verdict {
  const schemaIssues = validateArtifactBundle(bundle);
  const violations: RuleViolation[] = [];

  if (schemaIssues.length > 0) {
    for (const issue of schemaIssues) {
      violations.push({
        ruleId: "schema.guard",
        severity: "ERROR",
        message: `${issue.path}: ${issue.message}`
      });
    }
    return { status: "FAIL", violations };
  }

  const planIndex = new PlanIndex(bundle.executionPlan);
  for (const rule of allRules) {
    violations.push(...rule({ artifacts: bundle, planIndex }));
  }

  const status: "PASS" | "FAIL" = violations.some((v) => v.severity === "ERROR") ? "FAIL" : "PASS";
  return { status, violations };
}
