import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import FlowEditorLayout from "pages/layout/FlowEditorLayout";
import React from "react";
import {
  getBasicFlowData,
  getFlowEditorData,
} from "utils/routeUtils/queryUtils";

import { useStore } from "../../../../pages/FlowEditor/lib/store";
import { teamSearchSchema } from "..";

export const Route = createFileRoute("/_authenticated/$team/$flow")({
  validateSearch: zodValidator(teamSearchSchema),
  search: {
    middlewares: [stripSearchParams(true)],
  },
  beforeLoad: async ({ params }) => {
    const { team: teamSlug, flow: flowSlug } = params;

    const actualFlowSlug = flowSlug.split(",")[0];

    try {
      const flow = await getBasicFlowData(actualFlowSlug, teamSlug);
      const store = useStore.getState();

      await store.connectToFlow(flow.id);
      useStore.setState({
        flowName: flow.name,
        flowSlug: actualFlowSlug,
      });

      const flowEditorData = await getFlowEditorData(actualFlowSlug, teamSlug);

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

      store.getFlowInformation(actualFlowSlug, teamSlug);
    } catch (error) {
      throw new Error(
        `Failed to load flow: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <FlowEditorLayout>
      <Outlet />
    </FlowEditorLayout>
  );
}
