import { createFileRoute, Outlet } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";

import { useStore } from "../../pages/FlowEditor/lib/store";
import AuthenticatedLayout from "../../pages/layout/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  pendingComponent: DelayedLoadingIndicator,
  beforeLoad: async () => {
    useStore.getState().setPreviewEnvironment("editor");
  },
  component: () => (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  ),
});
