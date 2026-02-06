import { createFileRoute, Outlet } from "@tanstack/react-router";
import FlowSettingsLayout from "pages/FlowEditor/components/Settings/Flow/Layout";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <FlowSettingsLayout>
      <Outlet />
    </FlowSettingsLayout>
  );
}
