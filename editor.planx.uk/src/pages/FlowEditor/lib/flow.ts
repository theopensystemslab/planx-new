import { alg, Graph } from "graphlib";
import randomWords from "random-words";
import { v4 as uuid } from "uuid";

export interface Node {
  text: string;
}

export type Flow = {
  nodes: Record<string, Node>;
  edges: Array<[string | null, string]>;
};

export interface Op {
  p: Array<any>;
  li?: any;
  ld?: any;
  od?: any;
  oi?: any;
}

const toGraphlib = (flow: Flow): Graph => {
  // create a graph with the existing nodes and edges
  const g = new Graph({ directed: true, multigraph: false });
  Object.keys(flow.nodes).forEach((key) => {
    g.setNode(key);
  });
  flow.edges.forEach(([src, tgt]) => {
    g.setEdge(src, tgt);
  });
  return g;
};

export const insertNodeOp = (): Array<Op> => [
  { p: ["nodes", uuid()], oi: { text: randomWords() } },
];

export const removeNodeOp = (id: string, flow: Flow): Array<Op> => {
  const graph = toGraphlib(flow);
  const [, ...children] = alg.preorder(graph, [id]);
  const affectedNodes = [id, ...children];
  const affectedEdgeIndices = flow.edges
    .map(([src, tgt], index) =>
      affectedNodes.includes(src) || affectedNodes.includes(tgt) ? index : null
    )
    .filter((val) => val !== null)
    // Sort in descending order so that indices don't shift after each ShareDB operation
    .sort((a, b) => b - a);
  return [
    { p: ["nodes", id], od: flow.nodes[id] },
    ...children.map((childId) => ({
      p: ["nodes", childId],
      od: flow.nodes[childId],
    })),
    ...affectedEdgeIndices.map((edgeIndex) => ({
      p: ["edges", edgeIndex],
      ld: flow.edges[edgeIndex],
    })),
  ];
};

export const setFlowOp = (flow: Flow, prevFlow: Flow): Array<Op> => [
  { p: [], od: prevFlow, oi: flow },
];

export const isValidOp = (flow, src, tgt) => {
  if (src === tgt) {
    return false;
  }

  if (flow.edges.find(([s, t]) => s === src && t === tgt)) {
    return false;
  }

  const graph = toGraphlib(flow);
  graph.setEdge(src, tgt);

  if (!alg.isAcyclic(graph)) {
    return false;
  }

  return true;
};

export const connectOp = (src: string, tgt: string, flow: Flow): Array<Op> =>
  isValidOp
    ? [
        {
          p: ["edges", flow.edges.length],
          li: [src, tgt],
        },
      ]
    : [];
