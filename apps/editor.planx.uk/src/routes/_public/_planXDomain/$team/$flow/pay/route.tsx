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

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/pay")({
  loader: async ({ context }) => {
    const { team, flow } = context;
    const data = await fetchDataForStandaloneView(flow, team);
    setupStandaloneViewStore(data);
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
