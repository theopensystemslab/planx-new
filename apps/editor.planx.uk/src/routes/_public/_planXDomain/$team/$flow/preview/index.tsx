import { createFileRoute } from "@tanstack/react-router";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import Questions from "pages/Preview/Questions";
import { TestWarningPage } from "pages/Preview/TestWarningPage";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/preview/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <TestWarningPage>
      <SaveAndReturnLayout>
        <WatermarkBackground
          variant="dark"
          opacity={0.05}
          forceVisibility={true}
        />
        <Questions previewEnvironment="editor" />
      </SaveAndReturnLayout>
    </TestWarningPage>
  );
}
