import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import FlowEditorLayout from "pages/layout/FlowEditorLayout";
import React from "react";
import { z } from "zod";

import { useStore } from "../../../../pages/FlowEditor/lib/store";
import { getBasicFlowData, getFlowEditorData } from "./_utils";

const flowParamsSchema = z.object({
  team: z.string(),
  flow: z.string(),
});

// Empty search schema to override inherited search params from team route
const flowSearchSchema = z.object({});

export const Route = createFileRoute("/_authenticated/$team/$flow/")({
  params: {
    parse: flowParamsSchema.parse,
    stringify: ({ team, flow }) => ({ team, flow }),
  },
  validateSearch: flowSearchSchema,
  search: {
    middlewares: [
      stripSearchParams({ sort: "last-edited", sortDirection: "desc" }),
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
  component: FlowEditorLayout,
  errorComponent: ({ error }) => (
    <div>
      <h1>Flow Error</h1>
      <p>{error.message}</p>
    </div>
  ),
});
