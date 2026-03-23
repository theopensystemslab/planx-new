import {
  createFileRoute,
  notFound,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import ErrorFallback from "components/Error/ErrorFallback";
import FlowSkeleton from "pages/FlowEditor/FlowSkeleton";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CatchAllComponent } from "routes/$";
import {
  getBasicFlowData,
  getFlowEditorData,
} from "utils/routeUtils/queryUtils";

import { useStore } from "../../../../../pages/FlowEditor/lib/store";
import { teamSearchSchema } from "..";

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
  beforeLoad: async ({ params, context: { rootFlow } }) => {
    const { team: teamSlug } = params;
    const store = useStore.getState();

    // Don't re-connect to document when navigating to nested flows
    if (store.flowSlug === rootFlow) return;

    try {
      // Ensure we only have a single active connection
      store.disconnectFromFlow();

      const flow = await getBasicFlowData(rootFlow, teamSlug);
      await store.connectToFlow(flow.id);
      useStore.setState({
        flowName: flow.name,
        flowSlug: rootFlow,
      });

      const flowEditorData = await getFlowEditorData(rootFlow, teamSlug);

      useStore.setState({
        id: flowEditorData.id,
        flowStatus: flowEditorData.flowStatus,
        isFlowPublished: flowEditorData.isFlowPublished,
        isTemplate: flowEditorData.isTemplate,
        isTemplatedFrom: Boolean(flowEditorData.templatedFrom),
        template: flowEditorData.template,
      });

      if (flowEditorData.templatedFrom) {
        store.setOrderedFlow();
      }

      store.getFlowInformation(rootFlow, teamSlug);
    } catch (error) {
      throw notFound();
    }
  },
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
