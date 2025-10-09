import { createFileRoute } from "@tanstack/react-router";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import React from "react";

export const Route = createFileRoute("/_authenticated/$team/$flow/submissions")(
  {
    loader: async ({ params }) => {
      const { flow: flowSlug } = params;
      const actualFlowSlug = flowSlug.split(",")[0];

      return {
        flowSlug: actualFlowSlug,
      };
    },
    component: SubmissionsComponent,
  },
);

function SubmissionsComponent() {
  const { flowSlug } = Route.useLoaderData();

  return <Submissions flowSlug={flowSlug} />;
}
