import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import ErrorFallback from "components/Error/ErrorFallback";
import FlowSkeleton from "pages/FlowEditor/FlowSkeleton";
import { ErrorBoundary } from "react-error-boundary";
import { CatchAllComponent } from "routes/$";

import { teamSearchSchema } from "..";
import { connectToFlowRoute } from "./-route.utils";

export const Route = createFileRoute("/_authenticated/app/$team/$flow")({
  pendingComponent: FlowSkeleton,
  validateSearch: zodValidator(teamSearchSchema),
  search: {
    middlewares: [
      stripSearchParams([
        "sort",
        "sortDirection",
        "templates",
        "online-status",
        "flow-type",
        "lps-listing",
      ]),
    ],
  },
  context: ({ params }) => {
    const [rootFlow, ...folderIds] = params.flow.split(",");

    return { rootFlow, folderIds };
  },
  beforeLoad: async ({ params: { team }, context: { rootFlow } }) =>
    connectToFlowRoute(team, rootFlow),
  component: RouteComponent,
  notFoundComponent: CatchAllComponent,
});

function RouteComponent() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Outlet />
    </ErrorBoundary>
  );
}
