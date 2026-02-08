export type VerdictStatus = "PASS" | "FAIL";

export interface RuleViolation {
  ruleId: string;
  severity: "ERROR" | "WARN";
  message: string;
  stepIds?: string[];
  details?: Record<string, unknown>;
}

export interface Verdict {
  status: VerdictStatus;
  violations: RuleViolation[];
}

export interface RuleContext {
  artifacts: import("./artifacts.js").ArtifactBundle;
  planIndex: import("../core/planIndex.js").PlanIndex;
}

export type RuleFn = (ctx: RuleContext) => RuleViolation[];
