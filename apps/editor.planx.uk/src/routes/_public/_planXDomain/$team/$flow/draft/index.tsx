import { createFileRoute } from "@tanstack/react-router";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";

import { FlattenedFlow } from "../../../../../../utils/routeUtils/FlattenedFlow";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/draft/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { flow } = Route.useRouteContext();

  return (
    <SaveAndReturnLayout>
      <WatermarkBackground
        variant="dark"
        opacity={0.05}
        forceVisibility={true}
      />
      <FlattenedFlow mode="draft" flowId={flow.id}/>
    </SaveAndReturnLayout>
  );
}
