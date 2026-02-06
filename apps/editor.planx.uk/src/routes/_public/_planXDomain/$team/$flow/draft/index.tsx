import { createFileRoute } from "@tanstack/react-router";
import Questions from "pages/Preview/Questions";
import React from "react";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/draft/",
)({
  component: DraftIndexComponent,
});

function DraftIndexComponent() {
  return <Questions previewEnvironment="standalone" />;
}
