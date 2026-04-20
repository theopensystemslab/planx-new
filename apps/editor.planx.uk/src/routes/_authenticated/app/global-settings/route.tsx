import { createFileRoute, notFound, Outlet, rootRouteId } from "@tanstack/react-router";
import { client } from "lib/graphql";
import GlobalSettingsLayout from "pages/GlobalSettings/Layout";
import { GET_GLOBAL_SETTINGS } from "pages/GlobalSettings/queries";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/global-settings")({
  loader: async ({ context }) => {
    const isAuthorised = context.user?.isPlatformAdmin;
    if (!isAuthorised) throw notFound({ routeId: rootRouteId });

    // Pre-warm the Apollo cache so the Footer component reads immediately from cache
    await client.query({ query: GET_GLOBAL_SETTINGS });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <GlobalSettingsLayout>
      <Outlet />
    </GlobalSettingsLayout>
  );
}
