import { ExecutionPlan, PlanStep } from "../types/artifacts.js";

export class PlanIndex {
  readonly byId: Map<string, PlanStep>;
  readonly byProtocol: Map<string, PlanStep[]>;
  readonly steps: PlanStep[];

  constructor(plan: ExecutionPlan) {
    this.steps = [...plan.steps].sort((a, b) => a.index - b.index);
    this.byId = new Map();
    this.byProtocol = new Map();

    for (const step of this.steps) {
      this.byId.set(step.id, step);
      const arr = this.byProtocol.get(step.protocol) ?? [];
      arr.push(step);
      this.byProtocol.set(step.protocol, arr);
    }
  }

  getStep(id: string): PlanStep | undefined {
    return this.byId.get(id);
  }

  predecessors(step: PlanStep): PlanStep[] {
    if (!step.dependencies || step.dependencies.length === 0) return [];
    return step.dependencies.map((id) => this.byId.get(id)).filter((s): s is PlanStep => !!s);
  }

  successors(step: PlanStep): PlanStep[] {
    return this.steps.filter((s) => s.dependencies?.includes(step.id));
  }

  stepsByProtocol(protocol: string): PlanStep[] {
    return this.byProtocol.get(protocol) ?? [];
  }
}
