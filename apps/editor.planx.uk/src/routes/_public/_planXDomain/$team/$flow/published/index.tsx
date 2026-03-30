import { createFileRoute } from "@tanstack/react-router";
import OfflineLayout from "pages/layout/OfflineLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";

import { PublishedFlow } from "./-PublishedFlow";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/published/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OfflineLayout>
      <SaveAndReturnLayout>
        <WatermarkBackground variant="dark" opacity={0.05} />
        <PublishedFlow/>
      </SaveAndReturnLayout>
    </OfflineLayout>
  );
}
