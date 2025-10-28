import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { useStore } from "../../pages/FlowEditor/lib/store";
import AuthenticatedLayout from "../../pages/layout/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    useStore.getState().setPreviewEnvironment("editor");
  },
  component: () => (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  ),
});
