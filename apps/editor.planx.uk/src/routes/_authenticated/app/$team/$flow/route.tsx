import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import { CatchAllComponent } from "pages/ErrorPage/CatchAllComponent";
import FlowSkeleton from "pages/FlowEditor/FlowSkeleton";
import { useStore } from "pages/FlowEditor/lib/store";
import { editorPageTitle } from "utils/pageTitle";

import { flowsSearchSchema } from "../flows";
import { connectToFlowRoute } from "./-route.utils";

export const Route = createFileRoute("/_authenticated/app/$team/$flow")({
  pendingComponent: FlowSkeleton,
  validateSearch: zodValidator(flowsSearchSchema),
  search: {
    middlewares: [
      stripSearchParams([
        "sort",
        "sortDirection",
        "templates",
        "service-status",
        "flow-type",
        "lps-listing",
      ]),
    ],
  },
  context: ({ params }) => {
    const [rootFlow, ...folderIds] = params.flow.split(",");

    return { rootFlow, folderIds };
  },
  beforeLoad: async ({ params: { team }, context: { rootFlow } }) => {
    await connectToFlowRoute(team, rootFlow);
    return { flowName: useStore.getState().flowName };
  },
  component: RouteComponent,
  notFoundComponent: CatchAllComponent,
  head: ({ match }) =>
    editorPageTitle(match.context.flowName, match.context.team.name),
});

function RouteComponent() {
  return (
    <AppErrorBoundary>
      <Outlet />
    </AppErrorBoundary>
  );
}
