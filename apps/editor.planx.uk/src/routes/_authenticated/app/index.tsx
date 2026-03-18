import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import Teams from "pages/Teams";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/")({
  loader: () => {
    useStore.getState().clearTeamStore();
  },
  component: AuthenticatedHomeRoute,
});

function AuthenticatedHomeRoute() {
  const { teams } = useLoaderData({ from: "/_authenticated/app" });
  return (
    <>
      <Teams teams={teams} />
    </>
  );
}
