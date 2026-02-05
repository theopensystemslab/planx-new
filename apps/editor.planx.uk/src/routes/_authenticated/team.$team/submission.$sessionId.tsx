import { createFileRoute } from "@tanstack/react-router";
import SubmissionHTML from "pages/FlowEditor/components/Submissions/components/SubmissionHTML";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/team/$team/submission/$sessionId",
)({
  loader: async ({ params }) => ({
    sessionId: params.sessionId,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useLoaderData();
  return <SubmissionHTML sessionId={sessionId} />;
}
