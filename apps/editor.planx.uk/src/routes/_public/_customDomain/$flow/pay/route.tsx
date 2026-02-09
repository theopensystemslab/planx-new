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

export const Route = createFileRoute("/_public/_customDomain/$flow/pay")({
  beforeLoad: async ({ context }) => {
    const { team, flowSlug } = context;
    const data = await fetchDataForStandaloneView(flowSlug, team);
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
