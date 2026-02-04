import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import {
  createPublicRouteErrorComponent,
  PublicRouteLayout,
} from "utils/routeUtils/publicRouteHelpers";
import {
  fetchDataForStandaloneView,
  setupStandaloneViewStore,
} from "utils/routeUtils/standaloneViewHelpers";
import { getTeamFromDomain, validateTeamRoute } from "utils/routeUtils/utils";

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/pay")({
  beforeLoad: async ({ params }) => {
    const { team: teamParam, flow: flowParam } = params;

    await validateTeamRoute({ params });

    const externalDomainTeam = await getTeamFromDomain(
      window.location.hostname,
    );

    const data = await fetchDataForStandaloneView(flowParam, teamParam);
    setupStandaloneViewStore(data);

    return {
      isPreviewOnlyDomain: Boolean(externalDomainTeam),
      standaloneData: data,
    };
  },
  errorComponent: createPublicRouteErrorComponent("pay"),
  component: PayLayoutComponent,
});

function PayLayoutComponent() {
  return (
    <PublicRouteLayout mode="pay">
      <Outlet />
    </PublicRouteLayout>
  );
}
