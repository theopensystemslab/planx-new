import { createFileRoute, notFound } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { AdminPanelData } from "types";

import { client } from "../../lib/graphql";
import {
  PRODUCTION_ADMIN_PANEL_QUERY,
  STAGING_ADMIN_PANEL_QUERY,
} from "../../lib/utils";
import { PlatformAdminPanel } from "../../pages/PlatformAdminPanel/PlatformAdminPanel";

const AdminPanelRoute = () => {
  return <PlatformAdminPanel />;
};

export const Route = createFileRoute("/_authenticated/admin-panel")({
  beforeLoad: async ({ context }) => {
    const { user } = context;

    if (!user) {
      throw notFound();
    }
    const { isPlatformAdmin, isAnalyst } = user;
    const isAuthorised = isPlatformAdmin || isAnalyst;

    if (!isAuthorised) {
      throw notFound();
    }

    return { user };
  },
  loader: async ({ context }) => {
    const { user } = context;
    const { isPlatformAdmin } = user;

    // Select query based on environment
    const query =
      import.meta.env.VITE_APP_ENV === "production"
        ? PRODUCTION_ADMIN_PANEL_QUERY
        : STAGING_ADMIN_PANEL_QUERY;

    // Fetch admin panel data
    const { data } = await client.query<{ adminPanel: AdminPanelData[] }>({
      query,
      context: {
        headers: {
          "x-hasura-role": isPlatformAdmin ? "platformAdmin" : "analyst",
        },
      },
    });

    useStore.getState().setAdminPanelData(data.adminPanel);

    return {
      adminPanel: data.adminPanel,
    };
  },
  component: AdminPanelRoute,
});
