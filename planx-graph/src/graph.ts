import { alphabetId } from "./lib/id";
import { OT } from "./types/ot";

const ROOT_NODE_KEY = "_root";

interface Node {
  type?: number;
  data?: Object;
  edges: string[];
}

class Graph {
  protected nodes: Map<string, Node> = new Map();
  private counter = 0;

  constructor(private idFunction = alphabetId) {
    this.nodes.set(ROOT_NODE_KEY, { edges: [] });
  }

  private generateId() {
    return this.idFunction(this.counter++);
  }

  load(nodes) {
    Object.entries(nodes).forEach(([id, data]: [string, Node]) => {
      this.nodes.set(id, data);
    });
  }

  add(
    { id = this.generateId(), type, ...data },
    { parent = ROOT_NODE_KEY, children = [] } = {},
    ops = []
  ): Array<OT.Op> {
    this.nodes.get(parent).edges.push(id);
    ops.push({ p: [parent, "edges"], li: id });

    this.nodes.set(id, { type, data, edges: [] });
    ops.push({ p: [id], oi: { type, data, edges: [] } });

    children.map((child) =>
      this.add({ type: 200, ...child }, { parent: id }, ops)
    );

    return ops;
  }

  update(id, newData): Array<OT.Op> {
    const node = this.nodes.get(id);

    const ops = [];

    // TODO: make this work with a nested data structure
    const data = Object.entries(newData).reduce((acc, [k, v]) => {
      if (v === null || v === undefined) {
        ops.push({ p: [id, "data", k], od: acc[k] });
        delete acc[k];
      } else {
        if (acc[k]) {
          ops.push({ p: [id, "data", k], od: acc[k], oi: v });
        } else {
          ops.push({ p: [id, "data", k], oi: v });
        }
        acc[k] = v;
      }
      return acc;
    }, JSON.parse(JSON.stringify(node.data)));

    this.nodes.set(id, { ...node, data });

    return ops;
  }

  remove(id, ops = []): Array<OT.Op> {
    (this.nodes.get(id).edges || []).forEach((child) =>
      this.remove(child, ops)
    );

    ops.push({ p: id, od: this.nodes.get(id) });
    this.nodes.delete(id);

    this.nodes.forEach((node: any, nodeId: string) => {
      if (node.edges) {
        const idx = node.edges.indexOf(id);
        if (idx >= 0) {
          ops.push({ p: [nodeId, "edges", idx], ld: node.edges[idx] });
          node.edges.splice(idx, 1);
        }
      }
    });

    return ops;
  }

  move(
    id,
    { fromParent = ROOT_NODE_KEY, toBefore = undefined, toParent = undefined }
  ): Array<OT.Op> {
    toParent = toParent || fromParent;

    const ops = [];

    const fromIdx = this.nodes.get(fromParent).edges.indexOf(id);
    if (fromIdx >= 0) {
      this.nodes.get(fromParent).edges.splice(fromIdx, 1);
    } else {
      throw new Error(`'${id}' not found in '${fromParent}'`);
    }

    if (toBefore) {
      let toIdx = this.nodes.get(toParent).edges.indexOf(toBefore);
      if (toIdx >= 0) {
        this.nodes.get(toParent).edges.splice(toIdx, 0, id);
        ops.push({ lm: toIdx, p: [fromParent, "edges", fromIdx] });
      } else {
        throw new Error(`'${toBefore}' not found in '${toParent}'`);
      }
    } else {
      this.nodes.get(toParent).edges.push(id);
      // TODO: check this
      ops.push({ lm: Infinity, p: [fromParent, "edges", fromIdx] });
    }

    return ops;
  }

  // reading the graph

  toObject(): Record<string, Node> {
    return Object.fromEntries(this.nodes);
  }

  get upcomingNodeIds(): string[] {
    return this.nodes.get("_root").edges;
  }

  get currentNodeId(): string | null {
    return this.upcomingNodeIds.length > 0 ? this.upcomingNodeIds[0] : null;
  }
}

export default Graph;
