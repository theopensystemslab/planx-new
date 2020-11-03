import { TYPES } from "../pages/FlowEditor/data/types";
import { Graph, ROOT_NODE_KEY } from ".";

class Crawler {
  public readonly breadcrumbs: Record<string, Array<string>> = {};
  public onVisit: (id: string) => {};

  constructor(public readonly graph: Graph, { onVisit = undefined } = {}) {
    this.onVisit = onVisit;
  }

  visit(id: string) {
    if (!this.graph[id]) throw new Error("id not found");
    else if (this.breadcrumbs[id]) throw new Error("already visited");
    this.breadcrumbs[id] = [];
    if (this.onVisit) this.onVisit(id);
  }

  get upcomingIds(): Array<string> {
    const ids: Set<string> = new Set();

    const nodeIdsConnectedFrom = (source: string) =>
      this.graph[source].edges
        .filter(
          (id) => this.graph[id] && !Object.keys(this.breadcrumbs).includes(id)
        )
        .forEach((id) => {
          if (this.graph[id]?.type === TYPES.InternalPortal) {
            nodeIdsConnectedFrom(id);
          } else {
            ids.add(id);
          }
        });

    Object.entries(this.breadcrumbs)
      .reverse()
      .forEach(([, answers]) => {
        answers.forEach((answer) => nodeIdsConnectedFrom(answer));
      });

    nodeIdsConnectedFrom(ROOT_NODE_KEY);

    return Array.from(ids);
  }
}

export default Crawler;
