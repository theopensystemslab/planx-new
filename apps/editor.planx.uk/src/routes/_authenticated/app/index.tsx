import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import Teams from "pages/Teams";
import React from "react";

import { useAppLoaderData } from "./route";

export const Route = createFileRoute("/_authenticated/app/")({
  loader: () => {
    useStore.getState().clearTeamStore();
  },
  component: AuthenticatedHomeRoute,
});

function AuthenticatedHomeRoute() {
  const { teams } = useAppLoaderData();
  return (
    <>
      <Teams teams={teams} />
    </>
  );
}
