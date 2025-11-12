import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LoadingLayout } from "pages/layout/LoadingLayout";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import Main from "ui/shared/Main";
import { createPublicRouteErrorComponent } from "utils/routeUtils/publicRouteHelpers";
import {
  fetchDataForStandaloneView,
  setupStandaloneViewStore,
} from "utils/routeUtils/standaloneViewHelpers";
import { getTeamFromDomain, validateTeamRoute } from "utils/routeUtils/utils";

export const Route = createFileRoute("/$team/$flow/pay")({
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
    <LoadingLayout>
      <PublicLayout>
        <Main>
          <Outlet />
        </Main>
      </PublicLayout>
    </LoadingLayout>
  );
}
