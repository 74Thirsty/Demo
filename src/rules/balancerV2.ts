import { RuleFn, RuleViolation } from "../types/verdict.js";

const ruleBalancerNoUnlock: RuleFn = ({ planIndex }) => {
  const violations: RuleViolation[] = [];
  const steps = planIndex.stepsByProtocol("balancer_v2");
  const unlocks = steps.filter((s) => s.type === "unlock");

  if (unlocks.length > 0) {
    violations.push({
      ruleId: "balancer_v2.no_unlock",
      severity: "ERROR",
      message: "balancer_v2 plan contains unlock steps, which are forbidden",
      stepIds: unlocks.map((s) => s.id)
    });
  }

  return violations;
};

export const balancerV2Rules: RuleFn[] = [ruleBalancerNoUnlock];
