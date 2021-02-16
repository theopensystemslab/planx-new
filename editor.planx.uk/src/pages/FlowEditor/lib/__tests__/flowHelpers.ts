import { TYPES } from "@planx/components/types";

const flow = {
  _root: {
    edges: ["whatisit"],
  },
  whatisit: {
    type: TYPES.Statement,
    edges: ["food", "tool"],
    data: {
      fn: "item",
    },
  },
  food: {
    type: TYPES.Response,
    data: {
      val: "food",
    },
    edges: ["whichfood"],
  },
  tool: {
    type: TYPES.Response,
    data: {
      val: "tool",
    },
  },
  whichfood: {
    type: TYPES.Statement,
    edges: ["fruit", "cake"],
    data: {
      fn: "item",
    },
  },
  fruit: {
    type: TYPES.Response,
    data: {
      val: "food.fruit",
    },
  },
  cake: {
    type: TYPES.Response,
    data: {
      val: "food.cake",
    },
  },
};

export const isValid = (
  flow: any,
  onVisit?: (id: string, children: Array<string>) => void
): boolean => {
  const visited = new Set();

  const visit = (node: string) => {
    if (!visited.has(node)) {
      if (!flow.hasOwnProperty(node)) throw new Error("node not found");
      visited.add(node);

      const children = (flow as any)[node].edges || [];

      if (onVisit) onVisit(node, children);

      children.forEach(visit);
    }
  };

  visit("_root");

  if (visited.size !== Object.keys(flow).length)
    throw new Error("not visited everything");

  return true;
};

export const makeGraph = (flow: any) => {
  const graph: Array<string> = [];

  isValid(flow, (id, children) => {
    children.forEach((child) => {
      graph.push(`${id} -> ${child}`);
    });
  });

  console.log(graph.slice(1).join("\n"));
};

makeGraph(flow);
