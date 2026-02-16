import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import Main from "ui/shared/Main";
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
  component: PayLayoutComponent,
});

function PayLayoutComponent() {
  return (
    <Main>
      <Outlet />
    </Main>
  );
}
