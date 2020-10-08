import { alphabetId } from "./lib/id";

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

  add(
    { id = this.generateId(), type, ...data },
    { parent = ROOT_NODE_KEY, children = [] } = {}
  ) {
    this.nodes.get(parent).edges.push(id);
    this.nodes.set(id, { type, data, edges: [] });
    children.map((child) => this.add({ type: 200, ...child }, { parent: id }));
    return id;
  }

  remove(id) {
    this.nodes.get(id).edges.forEach((child) => this.remove(child));
    this.nodes.delete(id);
    this.nodes.forEach((node: any) => {
      const idx = node.edges.indexOf(id);
      if (idx >= 0) node.edges.splice(idx, 1);
    });
  }

  move(
    id,
    { fromParent = ROOT_NODE_KEY, toBefore = undefined, toParent = undefined }
  ) {
    toParent = toParent || fromParent;

    const idx = this.nodes.get(fromParent).edges.indexOf(id);
    if (idx >= 0) {
      this.nodes.get(fromParent).edges.splice(idx, 1);
    } else {
      throw new Error(`'${id}' not found in '${fromParent}'`);
    }

    if (toBefore) {
      let idx = this.nodes.get(toParent).edges.indexOf(toBefore);
      if (idx >= 0) {
        this.nodes.get(toParent).edges.splice(idx, 0, id);
      } else {
        throw new Error(`'${toBefore}' not found in '${toParent}'`);
      }
    } else {
      this.nodes.get(toParent).edges.push(id);
    }
  }
}

export default Graph;
