import { RuleFn, RuleViolation } from "../types/verdict.js";

const ruleAaveRepayBeforeCallback: RuleFn = ({ planIndex }) => {
  const violations: RuleViolation[] = [];
  const steps = planIndex.stepsByProtocol("aave_v3");

  const flashLoans = steps.filter((s) => s.type === "flash_loan");
  const callbacks = steps.filter((s) => s.type === "callback");
  const repays = steps.filter((s) => s.type === "repay");

  for (const fl of flashLoans) {
    const cb = callbacks.find((c) => c.dependencies?.includes(fl.id));
    if (!cb) {
      violations.push({
        ruleId: "aave_v3.flash_loan.callback_required",
        severity: "ERROR",
        message: `flash_loan step ${fl.id} has no callback dependency`,
        stepIds: [fl.id]
      });
      continue;
    }

    const relevantRepays = repays.filter((r) => r.index > fl.index && r.index < cb.index);
    if (relevantRepays.length === 0) {
      violations.push({
        ruleId: "aave_v3.flash_loan.repay_before_callback",
        severity: "ERROR",
        message: `no repay between flash_loan ${fl.id} and callback ${cb.id}`,
        stepIds: [fl.id, cb.id]
      });
    }
  }

  return violations;
};

export const aaveV3Rules: RuleFn[] = [ruleAaveRepayBeforeCallback];
