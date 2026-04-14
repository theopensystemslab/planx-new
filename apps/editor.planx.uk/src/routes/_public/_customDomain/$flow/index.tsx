import { createFileRoute } from "@tanstack/react-router";
import OfflineLayout from "pages/layout/OfflineLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import Questions from "pages/Preview/Questions";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";
export const Route = createFileRoute("/_public/_customDomain/$flow/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OfflineLayout>
      <SaveAndReturnLayout>
        <Questions previewEnvironment="standalone" />
      </SaveAndReturnLayout>
    </OfflineLayout>
  );
}
