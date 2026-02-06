import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "pages/Preview/ContentPage";
import React from "react";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/published/pages/$page",
)({
  beforeLoad: () => ({
    isContentPage: true,
  }),
  component: PublishedPageComponent,
});

function PublishedPageComponent() {
  const { page } = Route.useParams();
  return <ContentPage page={page} />;
}
