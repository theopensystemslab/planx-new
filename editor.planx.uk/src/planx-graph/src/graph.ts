import produce, { enableMapSet } from "immer";
import difference from "lodash/difference";
import trim from "lodash/trim";
import { alphabetId } from "./lib/id";
import { OT } from "./types/ot";

enableMapSet();

export const ROOT_NODE_KEY = "_root";

interface Node {
  type?: number;
  data?: Object;
  edges?: string[];
}

const sanitise = (str) =>
  typeof str === "string" ? trim(str.replace(/↵/g, "")) : str;

class Graph {
  protected nodes: Map<string, Node> = new Map();
  private counter = 0;

  constructor(private idFunction: Function = alphabetId) {
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
      v = sanitise(v);
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

    children = children.map((c) => ({ ...c, id: c.id || this.generateId() }));

    const ops = [];

    if (removeKeyIfMissing) {
      const addedChildrenIds = difference(
        children.map((c) => c.id),
        node.edges
      );
      addedChildrenIds.forEach((cId) =>
        this.add(
          children.find((c) => c.id === cId),
          { parent: id },
          ops
        )
      );

      const removedChildrenIds = difference(
        node.edges,
        children.map((c) => c.id)
      );
      removedChildrenIds.forEach((childId) =>
        this.remove(childId, { parent: id }, ops)
      );

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

      if (
        children.map((c) => c.id).toString() !== (node.edges || []).toString()
      ) {
        const oi = children.map((c) => c.id);
        if (node.edges) {
          ops.push({ p: [id, "edges"], od: node.edges, oi });
        } else {
          ops.push({ p: [id, "edges"], oi });
        }
        node.edges = oi;
      }
    }

    // TODO: make this work with a nested data structure
    const data = Object.entries(newData).reduce((acc, [k, v]) => {
      v = sanitise(v);
      if (v === null || v === undefined || v === "") {
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

  remove(
    id,
    { parent = ROOT_NODE_KEY, clones = undefined } = {},
    ops = []
  ): Array<OT.Op> {
    if (!clones) {
      // TODO: wrap this in immer so we don't need to pass down
      // a list of existing clones to recursive calls
      clones = new Set();
      this.nodes.forEach((_, id) => {
        if (this.isClone(id)) clones.add(id);
      });
    }

    if (clones.has(id)) {
      const node = this.nodes.get(parent);
      if (node) {
        node.edges = node.edges || [];
        const idx = node.edges.indexOf(id);
        if (idx >= 0) {
          if (node.edges.length === 1) {
            ops.push({ p: [parent, "edges"], od: node.edges });
            delete node.edges;
          } else {
            ops.push({ p: [parent, "edges", idx], ld: node.edges[idx] });
            node.edges.splice(idx, 1);
          }
        }
      }
    } else {
      const { edges = [] } = this.nodes.get(id);

      ops.push({ p: [id], od: this.nodes.get(id) });
      this.nodes.delete(id);

      this.nodes.forEach((node: any, nodeId: string) => {
        if (node.edges) {
          const idx = node.edges.indexOf(id);
          if (idx >= 0) {
            if (node.edges.length === 1) {
              ops.push({ p: [nodeId, "edges"], od: node.edges });
              delete node.edges;
            } else {
              ops.push({ p: [nodeId, "edges", idx], ld: node.edges[idx] });
              node.edges.splice(idx, 1);
            }
          }
        }
      });

      edges.forEach((child) => this.remove(child, { parent: id, clones }, ops));
    }

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

    this.nodes = produce(this.nodes, (draft) => {
      if (clone) {
        if (
          Array.isArray(draft.get(toParent).edges) &&
          draft.get(toParent).edges.includes(id)
        ) {
          throw new Error("cannot clone to same parent");
        }
      } else {
        draft.get(fromParent).edges.splice(fromIdx, 1);
        if (fromParent !== toParent) {
          if (
            Array.isArray(draft.get(toParent).edges) &&
            draft.get(toParent).edges.includes(id)
          ) {
            throw new Error("cannot move to same parent");
          }

          if (draft.get(fromParent).edges.length === 0) {
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
        let toIdx = draft.get(toParent).edges.indexOf(toBefore);
        if (toIdx >= 0) {
          draft.get(toParent).edges.splice(toIdx, 0, id);
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
        if (!draft.get(toParent).edges) {
          ops.push({ p: [toParent, "edges"], oi: [] });
          draft.get(toParent).edges = [];
        }

        if (fromParent === toParent) {
          ops.push({
            lm: draft.get(toParent).edges.length,
            p: [fromParent, "edges", fromIdx],
          });
        } else {
          ops.push({
            li: originalNode,
            p: [toParent, "edges", draft.get(toParent).edges.length],
          });
        }
        draft.get(toParent).edges.push(id);
      }

      if (this.isCyclic(draft)) {
        throw new Error("cannot create cycle in graph");
      }
    });

    return ops;
  }

  isClone(id: string): boolean {
    let occurrences = 0;
    this.nodes.forEach(({ edges = [] }) => {
      if (edges.includes(id)) occurrences++;
    });
    return occurrences > 1;
  }

  private isCyclicUtil(src, visited, recStack, graph): boolean {
    if (recStack[src]) return true;
    else if (visited[src]) return false;

    visited[src] = true;
    recStack[src] = true;

    const { edges = [] } = graph.get(src);
    for (let tgt of edges) {
      if (this.isCyclicUtil(tgt, visited, recStack, graph)) return true;
    }
    recStack[src] = false;
    return false;
  }

  isCyclic(graph = this.nodes): boolean {
    const visited = {};
    const recStack = {};

    graph.forEach((_value, key) => {
      visited[key] = false;
      recStack[key] = false;
    });

    for (let key of Object.keys(visited)) {
      if (this.isCyclicUtil(key, visited, recStack, graph)) return true;
    }
    return false;
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
