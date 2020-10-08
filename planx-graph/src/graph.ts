import { alphabetId } from "./lib/id";

class Graph {
  protected nodes = new Map();

  constructor(private generateId = alphabetId) {}

  add({ id = this.generateId(), type, ...data }, children = []) {
    const edges = children.map((child) => this.add({ type: 200, ...child }));
    this.nodes.set(id, { type, data, edges: new Set(edges) });
    return id;
  }

  remove(id) {
    this.nodes.get(id).edges.forEach((child) => this.remove(child));
    this.nodes.delete(id);
    this.nodes.forEach((node: any) => {
      if (node.edges.has(id)) node.edges.delete(id);
    });
  }
}

export default Graph;
