import { createFileRoute, Outlet } from "@tanstack/react-router";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { publicLoader } from "routes/_public/-loader";

export const Route = createFileRoute("/_public/_customDomain")({
  beforeLoad: publicLoader,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}
