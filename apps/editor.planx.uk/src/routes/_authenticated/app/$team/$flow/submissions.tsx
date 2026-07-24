import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions",
)({
  pendingComponent: DelayedLoadingIndicator,
  loader: async ({ params }) => {
    const { flow } = params;
    return { flow };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  return <Submissions flowSlug={data.flow} />;
}
