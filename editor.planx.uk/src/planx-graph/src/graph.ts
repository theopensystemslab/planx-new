import difference from "lodash/difference";
import { alphabetId } from "./lib/id";
import { OT } from "./types/ot";

export const ROOT_NODE_KEY = "_root";

interface Node {
  type?: number;
  data?: Object;
  edges?: string[];
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
    { parent = ROOT_NODE_KEY, before = undefined, children = [] } = {},
    ops = []
  ): Array<OT.Op> {
    if (!this.nodes.get(parent).edges) {
      ops.push({ p: [parent, "edges"], oi: [] });
      this.nodes.get(parent).edges = [];
    }

    const idx = this.nodes.get(parent).edges.indexOf(before);
    if (idx >= 0) {
      ops.push({
        p: [parent, "edges", idx],
        li: id,
      });
      this.nodes.get(parent).edges.splice(idx, 0, id);
    } else {
      ops.push({
        p: [parent, "edges", this.nodes.get(parent).edges.length],
        li: id,
      });
      this.nodes.get(parent).edges.push(id);
    }

    const filteredData = Object.entries(data).reduce((acc, [k, v]) => {
      if (v !== null && v !== undefined && v !== "") {
        acc[k] = v;
      }
      return acc;
    }, {});

    ops.push({ p: [id], oi: { type, data: filteredData } });
    this.nodes.set(id, { type, data: filteredData });

    children.map((child) =>
      this.add({ type: 200, ...child }, { parent: id }, ops)
    );

    return ops;
  }

  update(
    id,
    newData,
    { children = [], removeKeyIfMissing = false } = {}
  ): Array<OT.Op> {
    const node = this.nodes.get(id);

    const ops = [];

    if (removeKeyIfMissing) {
      const removedChildrenIds = difference(
        node.edges,
        children.map((c) => c.id)
      );
      removedChildrenIds.forEach((id) => this.remove(id, ops));

      // if a value exists in the current data, but is null, undefined or "" in the
      // new data then remove it
      Object.entries(node.data).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          if (
            newData[k] === null ||
            newData[k] === undefined ||
            newData[k] === ""
          ) {
            ops.push({ p: [id, "data", k], od: v });
            delete node.data[k];
          }
        }
      });
    }

    // TODO: make this work with a nested data structure
    const data = Object.entries(newData).reduce((acc, [k, v]) => {
      if (
        v === null ||
        v === undefined ||
        (typeof v === "string" && v.trim() === "")
      ) {
        if (acc.hasOwnProperty(k)) {
          ops.push({ p: [id, "data", k], od: acc[k] });
          delete acc[k];
        }
      } else if (v !== acc[k]) {
        if (acc.hasOwnProperty(k)) {
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
    const { edges = [] } = this.nodes.get(id);

    ops.push({ p: [id], od: this.nodes.get(id) });
    this.nodes.delete(id);

    this.nodes.forEach((node: any, nodeId: string) => {
      if (node.edges) {
        const idx = node.edges.indexOf(id);
        if (idx >= 0) {
          ops.push({ p: [nodeId, "edges", idx], ld: node.edges[idx] });
          node.edges.splice(idx, 1);

          if (node.edges.length === 0) {
            ops.push({ p: [nodeId, "edges"], od: [] });
            delete node.edges;
          }
        }
      }
    });

    edges.forEach((child) => this.remove(child, ops));

    return ops;
  }

  move(
    id,
    {
      fromParent = ROOT_NODE_KEY,
      toBefore = undefined,
      toParent = undefined,
      clone = false,
    }
  ): Array<OT.Op> {
    toParent = toParent || fromParent;

    const ops = [];

    const fromIdx = this.nodes.get(fromParent).edges.indexOf(id);
    let originalNode;

    if (fromIdx >= 0) {
      originalNode = this.nodes.get(fromParent).edges[fromIdx];
    } else {
      throw new Error(`'${id}' not found in '${fromParent}'`);
    }

    if (!clone) {
      this.nodes.get(fromParent).edges.splice(fromIdx, 1);
      if (fromParent !== toParent) {
        if (this.nodes.get(fromParent).edges.length === 0) {
          ops.push({
            od: [],
            p: [fromParent, "edges"],
          });
        } else {
          ops.push({
            ld: originalNode,
            p: [fromParent, "edges", fromIdx],
          });
        }
      }
    }

    if (toBefore) {
      let toIdx = this.nodes.get(toParent).edges.indexOf(toBefore);
      if (toIdx >= 0) {
        this.nodes.get(toParent).edges.splice(toIdx, 0, id);
        if (fromParent === toParent) {
          ops.push({ lm: toIdx, p: [fromParent, "edges", fromIdx] });
        } else {
          ops.push({
            li: originalNode,
            p: [toParent, "edges", toIdx],
          });
        }
      } else {
        throw new Error(`'${toBefore}' not found in '${toParent}'`);
      }
    } else {
      if (!this.nodes.get(toParent).edges) {
        ops.push({ p: [toParent, "edges"], oi: [] });
        this.nodes.get(toParent).edges = [];
      }

      if (fromParent === toParent) {
        ops.push({
          lm: this.nodes.get(toParent).edges.length,
          p: [fromParent, "edges", fromIdx],
        });
      } else {
        ops.push({
          li: originalNode,
          p: [toParent, "edges", this.nodes.get(toParent).edges.length],
        });
      }

      this.nodes.get(toParent).edges.push(id);
    }

    return ops;
  }

  // reading the graph

  toObject(): Record<string, Node> {
    return Object.fromEntries(this.nodes);
  }

  get upcomingNodeIds(): string[] {
    return this.nodes.get(ROOT_NODE_KEY).edges;
  }

  get currentNodeId(): string | null {
    return this.upcomingNodeIds.length > 0 ? this.upcomingNodeIds[0] : null;
  }
}

export default Graph;
