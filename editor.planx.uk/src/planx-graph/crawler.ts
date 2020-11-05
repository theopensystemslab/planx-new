import { TYPES } from "../pages/FlowEditor/data/types";
import { Graph, ROOT_NODE_KEY } from ".";

const QUESTION_TYPES = [TYPES.Statement, TYPES.Checklist];

class Crawler {
  public readonly breadcrumbs: Record<string, Array<string>> = {};
  public onRecord: (id: string) => {};

  constructor(public readonly graph: Graph, { onRecord = undefined } = {}) {
    this.onRecord = onRecord;
  }

  record(id: string, vals: Array<string>) {
    if (!this.graph[id]) throw new Error("id not found");
    else if (this.breadcrumbs[id]) throw new Error("already recorded");
    this.breadcrumbs[id] = vals;
    if (this.onRecord) this.onRecord(id);
  }

  get upcomingIds(): Array<string> {
    const ids: Set<string> = new Set();

    const nodeIdsConnectedFrom = (source: string) => {
      return this.graph[source].edges
        ?.filter(
          (id) =>
            !Object.keys(this.breadcrumbs).includes(id) &&
            (!QUESTION_TYPES.includes(this.graph[id].type) ||
              this.graph[id]?.edges?.length > 0)
        )
        .forEach((id) => {
          if (this.graph[id]?.type === TYPES.InternalPortal) {
            nodeIdsConnectedFrom(id);
          } else {
            ids.add(id);
          }
        });
    };

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
