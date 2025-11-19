import { createFileRoute } from "@tanstack/react-router";
import { ReadMePage } from "pages/FlowEditor/ReadMePage/ReadMePage";
import React from "react";

import { useStore } from "../../../../pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/$team/$flow/about")({
  loader: async ({ params }) => {
    const { team: teamSlug, flow: flowSlug } = params;
    const actualFlowSlug = flowSlug.split(",")[0];

    const flowInformation = await useStore
      .getState()
      .getFlowInformation(actualFlowSlug, teamSlug);

    return {
      teamSlug,
      flowSlug: actualFlowSlug,
      flowInformation,
    };
  },
  component: AboutComponent,
});

function AboutComponent() {
  const { teamSlug, flowSlug, flowInformation } = Route.useLoaderData();

  return (
    <ReadMePage
      teamSlug={teamSlug}
      flowSlug={flowSlug}
      flowInformation={flowInformation}
    />
  );
}
