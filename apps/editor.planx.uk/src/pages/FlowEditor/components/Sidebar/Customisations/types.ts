import { NodeId } from "@opensystemslab/planx-core/types";

// TODO: Correctly type detailed NodeData
type NodeData = Record<string, unknown>;

export type NodeEdits = Partial<NodeData>;
export type FlowEdits = Record<NodeId, NodeEdits>;
