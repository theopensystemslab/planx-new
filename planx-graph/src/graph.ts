import { alphabetId } from "./lib/id";

const ROOT_NODE_KEY = "_root";

interface Node {
  type?: number;
  data?: Object;
  edges: Set<string>;
}

class Graph {
  protected nodes: Map<string, Node> = new Map();
  private counter = 0;

  constructor(private idFunction = alphabetId) {
    this.nodes.set(ROOT_NODE_KEY, { edges: new Set() });
  }

  private generateId() {
    return this.idFunction(this.counter++);
  }

  add(
    { id = this.generateId(), type, ...data },
    { parent = ROOT_NODE_KEY, children = [] } = {}
  ) {
    this.nodes.get(parent).edges.add(id);
    this.nodes.set(id, { type, data, edges: new Set() });
    children.map((child) => this.add({ type: 200, ...child }, { parent: id }));
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
