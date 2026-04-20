import { createFileRoute, notFound, Outlet, rootRouteId } from "@tanstack/react-router";
import { gql } from "graphql-tag";
import { client } from "lib/graphql";
import GlobalSettingsLayout from "pages/GlobalSettings/Layout";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/global-settings")({
  loader: async ({ context }) => {
    const isAuthorised = context.user?.isPlatformAdmin;
    if (!isAuthorised) throw notFound({ routeId: rootRouteId });

    const { data } = await client.query({
      query: gql`
        query {
          globalSettings: global_settings {
            footerContent: footer_content
          }
        }
      `,
    });
    useStore.getState().setGlobalSettings(data.globalSettings[0]);
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
