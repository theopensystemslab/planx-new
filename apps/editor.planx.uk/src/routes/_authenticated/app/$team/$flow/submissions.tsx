import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { hasFeatureFlag } from "lib/featureFlags";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import SubmissionsGrouped from "pages/FlowEditor/components/Submissions/SubmissionsGrouped";
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
  if (hasFeatureFlag("GROUPED_SUBMISSIONS")) {
    return <SubmissionsGrouped flowSlug={data.flow} />;
  } else {
    return <Submissions flowSlug={data.flow} />;
  }
}
