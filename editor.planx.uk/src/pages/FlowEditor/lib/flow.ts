import { alg, Graph } from "graphlib";
import difference from "lodash/difference";
import randomWords from "random-words";
import { v4 as uuid } from "uuid";

export enum TYPES {
  Flow = 1,
  SignIn = 2,
  Result = 3,
  Report = 4,
  PropertyInformation = 5,
  FindProperty = 6,
  TaskList = 7,
  Notice = 8,
  Statement = 100, // Question/DropDown
  Checklist = 105,
  TextInput = 110,
  DateInput = 120,
  AddressInput = 130,
  FileUpload = 140,
  NumberInput = 150,
  Response = 200,
  Portal = 300,
}

export interface Node {
  text: string;
  $t?: TYPES;
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
  const [root, ...children] = alg.preorder(graph, [id]);

  graph.removeNode(root);
  const rootInEdgeIdx = flow.edges.findIndex(([, tgt]) => tgt === id);

  const [, ...remaining] = alg.preorder(graph, ["null"]);
  const affectedNodes = difference(children, remaining);

  const affectedEdgeIndices = flow.edges
    .map(([src, tgt], index) =>
      affectedNodes.includes(src) || affectedNodes.includes(tgt) ? index : null
    )
    .filter((val) => val !== null);

  affectedEdgeIndices.push(rootInEdgeIdx);

  return [
    { p: ["nodes", id], od: flow.nodes[id] },
    ...affectedNodes.map((nodeId) => ({
      p: ["nodes", nodeId],
      od: flow.nodes[nodeId],
    })),
    // Sort in descending order so that indices don't shift after each ShareDB operation
    ...affectedEdgeIndices
      .sort((a, b) => b - a)
      .map((edgeIndex) => ({
        p: ["edges", edgeIndex],
        ld: flow.edges[edgeIndex],
      })),
  ];
};

export const setFlowOp = (flow: Flow, prevFlow: Flow): Array<Op> => [
  { p: [], od: prevFlow, oi: flow },
];

export const isValidOp = (
  flow: Flow,
  src: string,
  tgt: string,
  shouldCheckForDuplicate = true
) => {
  if (src === tgt) {
    console.error(`${src} === ${tgt}`);
    return false;
  }

  if (
    shouldCheckForDuplicate &&
    flow.edges.find(([s, t]) => s === src && t === tgt)
  ) {
    console.error(`edge exists (${src}, ${tgt})`);
    return false;
  }

  const graph = toGraphlib(flow);
  graph.setEdge(src, tgt);

  if (!alg.isAcyclic(graph)) {
    console.error(`cycle in graph`);
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
