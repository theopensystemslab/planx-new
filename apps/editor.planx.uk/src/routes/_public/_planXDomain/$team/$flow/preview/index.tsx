import { createFileRoute } from "@tanstack/react-router";
import { TestWarningPage } from "pages/Preview/TestWarningPage";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";

import { FlattenedFlow } from "../../../../../../utils/routeUtils/FlattenedFlow";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/preview/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { flow } = Route.useRouteContext();

  return (
    <TestWarningPage>
      <WatermarkBackground
        variant="dark"
        opacity={0.05}
        forceVisibility={true}
      />
      <FlattenedFlow mode="preview" flowId={flow.id} />
    </TestWarningPage>
  );
}
