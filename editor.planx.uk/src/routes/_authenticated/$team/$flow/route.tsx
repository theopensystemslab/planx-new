import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import FlowEditorLayout from "pages/layout/FlowEditorLayout";
import React from "react";

import { useStore } from "../../../../pages/FlowEditor/lib/store";
import { teamSearchSchema } from "..";
import { getBasicFlowData, getFlowEditorData } from "./_utils";

export const Route = createFileRoute("/_authenticated/$team/$flow")({
  validateSearch: zodValidator(teamSearchSchema),
  search: {
    middlewares: [
      stripSearchParams([
        "sort",
        "sortDirection",
        "templates",
        "online-status",
        "type",
      ]),
    ],
  },
  beforeLoad: async ({ params }) => {
    const { team: teamSlug, flow: flowSlug } = params;

    const actualFlowSlug = flowSlug.split(",")[0];

    try {
      const flow = await getBasicFlowData(actualFlowSlug, teamSlug);

      const store = useStore.getState();
      store.setFlowName(flow.name);
      store.setFlowSlug(actualFlowSlug);
      await store.connectTo(flow.id);

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
