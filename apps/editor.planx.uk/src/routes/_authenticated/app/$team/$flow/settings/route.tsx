import { createFileRoute, Outlet } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import FlowSettingsLayout from "pages/FlowEditor/components/Settings/Flow/Layout";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings",
)({
  pendingComponent: DelayedLoadingIndicator,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <FlowSettingsLayout>
      <Outlet />
    </FlowSettingsLayout>
  );
}
