import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import React from "react";
import { getTeamFromDomain } from "utils/routeUtils/utils";

import { useStore } from "../../../pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/$team")({
  pendingComponent: RouteLoadingIndicator,
  beforeLoad: async ({ params }) => {
    const { initTeamStore, teamSlug: currentSlug } = useStore.getState();
    const routeSlug =
      params.team || (await getTeamFromDomain(window.location.hostname));

    if (currentSlug !== routeSlug) {
      try {
        await initTeamStore(routeSlug);
      } catch (error) {
        throw notFound();
      }
    }

    // Validate team route for custom domains
    const externalTeamName = await getTeamFromDomain(window.location.hostname);
    if (params.team && externalTeamName && externalTeamName !== params.team) {
      throw notFound();
    }
  },
  loader: ({ params }) => ({
    team: params.team,
  }),
  component: TeamLayout,
});

function TeamLayout() {
  return <Outlet />;
}
