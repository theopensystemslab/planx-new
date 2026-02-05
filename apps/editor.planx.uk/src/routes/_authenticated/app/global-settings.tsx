import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { gql } from "graphql-tag";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";

import GlobalSettingsView from "../../../pages/GlobalSettings";

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
  component: GlobalSettingsView,
});
