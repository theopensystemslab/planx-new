import { useLoaderData } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute(
  "/_public/_editor.planx.uk/$team/$flow/$sessionId/hello",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const context = useLoaderData({
    from: "/_public/_editor.planx.uk/$team/$flow",
  });
  const { sessionId } = Route.useParams();
  return (
    <>
      <div>Team: {context.teamSlug}</div>
      <div>Flow: {context.flowSlug}</div>
      <div>Session: {sessionId}</div>
    </>
  );
}
