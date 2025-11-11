import { createFileRoute } from "@tanstack/react-router";
import Questions from "pages/Preview/Questions";
import React from "react";

export const Route = createFileRoute("/$team/$flow/published/")({
  component: PublishedIndexComponent,
});

function PublishedIndexComponent() {
  return <Questions previewEnvironment="standalone" />;
}
