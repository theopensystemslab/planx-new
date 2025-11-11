import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "pages/Preview/ContentPage";
import React from "react";

export const Route = createFileRoute("/$team/$flow/draft/pages/$page")({
  component: DraftPageComponent,
});

function DraftPageComponent() {
  const { page } = Route.useParams();
  return <ContentPage page={page} />;
}
