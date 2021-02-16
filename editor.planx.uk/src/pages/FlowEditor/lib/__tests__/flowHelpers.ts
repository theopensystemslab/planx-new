import { TYPES } from "@planx/components/types";

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

  return graph.slice(1).join("\n");
};

export const toDot = (flow: any) => {
  const graph: Array<string> = [];
  const nodes: Array<string> = [];

  isValid(flow, (id, children) => {
    children.forEach((child) => {
      graph.push(`"${id}" -> "${child}";`);

      const node = flow[child];

      const label = [child, node.data?.fn || node.data?.val, node.data?.flag]
        .filter(Boolean)
        .join("|");

      if (node.type === TYPES.Statement) {
        nodes.push(`
        "${child}" [
          label = "{${label}}"
        ]
      `);
      } else {
        nodes.push(`
        "${child}" [
          label = "{${label}}",
          fillcolor = "#A8A8A8",
          style = "filled"
        ]
      `);
      }
    });
  });

  const output = `
  digraph {
    rankdir = "TD";
    node [
      shape = "record";
    ];
    ${graph.slice(1).join("\n  ")}
    ${nodes.join("")}
  }
`;

  return output;
};
