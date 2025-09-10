import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import AuthenticatedLayout from "../../pages/layout/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  ),
});
