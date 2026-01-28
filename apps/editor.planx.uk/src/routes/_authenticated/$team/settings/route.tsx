import { createFileRoute, Outlet } from "@tanstack/react-router";
import TeamSettingsLayout from "pages/FlowEditor/components/Settings/Team/Layout";
import React from "react";

export const Route = createFileRoute("/_authenticated/$team/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <TeamSettingsLayout>
      <Outlet />
    </TeamSettingsLayout>
  );
}
