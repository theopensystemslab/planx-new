import { createFileRoute, notFound } from "@tanstack/react-router";
import React from "react";

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
  component: AdminPanelRoute,
});
