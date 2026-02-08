export interface ExecutionPlan {
  cycle_id: string;
  version: string;
  network: string;
  steps: PlanStep[];
}

export interface PlanStep {
  id: string;
  index: number;
  protocol: string;
  type: string;
  target: string;
  func: string;
  calldata: string;
  value: string;
  tags?: string[];
  dependencies?: string[];
}

export interface AbiRegistrySnapshot {
  network: string;
  contracts: ContractABI[];
}

export interface ContractABI {
  address: string;
  protocol: string;
  abi: unknown[];
  labels?: Record<string, string>;
}

export interface LoanRegistrySnapshot {
  network: string;
  loans: LoanRecord[];
}

export interface LoanRecord {
  loan_id: string;
  protocol: string;
  asset: string;
  amount: string;
  borrower: string;
  tags?: string[];
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  kind: string;
  ref?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: string;
}

export interface CycleMetadata {
  cycle_id: string;
  created_at?: string;
  created_by?: string;
  notes?: string;
}

export interface ArtifactBundle {
  executionPlan: ExecutionPlan;
  abiRegistry: AbiRegistrySnapshot;
  loanRegistry: LoanRegistrySnapshot;
  graphSnapshot?: GraphSnapshot;
  cycleMetadata?: CycleMetadata;
}
