import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import FlowEditorLayout from "pages/layout/FlowEditorLayout";
import React from "react";
import { z } from "zod";

import { useStore } from "../../../../pages/FlowEditor/lib/store";
import { getBasicFlowData, getFlowEditorData } from "./_utils";

const flowSearchSchema = z.object({
  type: z.string().optional(),
  sort: z.enum(["last-edited", "last-published", "name"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const Route = createFileRoute("/_authenticated/$team/$flow")({
  validateSearch: flowSearchSchema,
  search: {
    // Strip inherited team-level search params while preserving flow-level params
    middlewares: [stripSearchParams(["sort", "sortDirection"])],
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
