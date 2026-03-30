import { createFileRoute } from "@tanstack/react-router";
import OfflineLayout from "pages/layout/OfflineLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import { PublishedFlow } from "utils/routeUtils/PublishedFlow";

export const Route = createFileRoute("/_public/_customDomain/$flow/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { flow } = Route.useRouteContext();

  return (
    <OfflineLayout>
      <SaveAndReturnLayout>
        <PublishedFlow flowId={flow.id}/>
      </SaveAndReturnLayout>
    </OfflineLayout>
  );
}
