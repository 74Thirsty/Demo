import { PlanStep } from "../types/artifacts.js";
import { RuleFn, RuleViolation } from "../types/verdict.js";

function firstIndex(steps: PlanStep[]): number | undefined {
  return steps.length ? Math.min(...steps.map((s) => s.index)) : undefined;
}

function lastIndex(steps: PlanStep[]): number | undefined {
  return steps.length ? Math.max(...steps.map((s) => s.index)) : undefined;
}

const ruleUniswapV4Sequence: RuleFn = ({ planIndex }) => {
  const violations: RuleViolation[] = [];
  const steps = planIndex.stepsByProtocol("uniswap_v4");

  if (steps.length === 0) return violations;

  const unlocks = steps.filter((s) => s.type === "unlock");
  const locks = steps.filter((s) => s.type === "lock");
  const swaps = steps.filter((s) => s.type === "swap");
  const settles = steps.filter((s) => s.type === "settle");

  if (unlocks.length === 0 || locks.length === 0) {
    violations.push({
      ruleId: "uniswap_v4.session_required",
      severity: "ERROR",
      message: "uniswap_v4 plan must contain at least one unlock and one lock step",
      stepIds: steps.map((s) => s.id)
    });
    return violations;
  }

  const firstUnlock = firstIndex(unlocks)!;
  const lastLock = lastIndex(locks)!;
  const firstSwap = firstIndex(swaps);
  const lastSwap = lastIndex(swaps);
  const firstSettle = firstIndex(settles);
  const lastSettle = lastIndex(settles);

  if (firstSwap !== undefined && firstSwap < firstUnlock) {
    violations.push({
      ruleId: "uniswap_v4.unlock_before_swaps",
      severity: "ERROR",
      message: "swaps occur before unlock in uniswap_v4 plan",
      stepIds: swaps.map((s) => s.id)
    });
  }

  if (lastSettle !== undefined && lastSettle > lastLock) {
    violations.push({
      ruleId: "uniswap_v4.settle_before_lock",
      severity: "ERROR",
      message: "settle occurs after lock in uniswap_v4 plan",
      stepIds: settles.map((s) => s.id)
    });
  }

  if (firstSettle !== undefined && lastSwap !== undefined && firstSettle < lastSwap) {
    violations.push({
      ruleId: "uniswap_v4.swaps_before_settle",
      severity: "ERROR",
      message: "settle must occur after all swaps in uniswap_v4 plan",
      stepIds: [...swaps, ...settles].map((s) => s.id)
    });
  }

  return violations;
};

export const uniswapV4Rules: RuleFn[] = [ruleUniswapV4Sequence];
