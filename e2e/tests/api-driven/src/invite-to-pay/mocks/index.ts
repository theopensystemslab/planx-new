import type {
  FlowGraph,
  Breadcrumbs,
  Passport,
  Node,
} from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import flow from "./flow.json";
import session from "./session.json";

export const mockBreadcrumbs = session.data?.breadcrumbs as Breadcrumbs;

export const mockPassport = session.data?.passport as Passport;

export const inviteToPayFlowGraph = flow.data as FlowGraph;

export function sendNodeWithDestination(destination: string): Node {
  return {
    type: ComponentType.Send,
    data: {
      title: "Send",
      destinations: [destination.toLowerCase()],
    },
  };
}
