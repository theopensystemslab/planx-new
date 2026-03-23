import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import Main from "ui/shared/Main";
import { createPublicRouteErrorComponent } from "utils/routeUtils/publicRouteHelpers";
import {
  fetchDataForStandaloneView,
  setupStandaloneViewStore,
} from "utils/routeUtils/standaloneViewHelpers";

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/pay")({
  beforeLoad: async ({ context }) => {
    const { team, flow } = context;
    const data = await fetchDataForStandaloneView(flow, team);
    setupStandaloneViewStore(data);
  },
  errorComponent: createPublicRouteErrorComponent("published"),
  component: PayLayoutComponent,
});

function PayLayoutComponent() {
  return (
    <Main>
      <Outlet />
    </Main>
  );
}
