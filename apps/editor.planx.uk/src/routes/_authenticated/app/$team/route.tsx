import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import React from "react";
import { CatchAllComponent } from "routes/$";

import { useStore } from "../../../../pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/app/$team")({
  pendingComponent: RouteLoadingIndicator,
  beforeLoad: async ({ params }) => {
    const { initTeamStore, teamSlug: currentSlug } = useStore.getState();

    if (currentSlug !== params.team) {
      try {
        await initTeamStore(params.team);
      } catch (error) {
        throw notFound();
      }
    }
  },
  component: TeamLayout,
  notFoundComponent: CatchAllComponent,
});

function TeamLayout() {
  return <Outlet />;
}
