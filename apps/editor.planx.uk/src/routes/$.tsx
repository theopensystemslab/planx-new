import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import React from "react";

export const Route = createFileRoute("/$")({
  component: CatchAllComponent,
});

function CatchAllComponent() {
  const params = Route.useParams();
  const splat = params._splat || "";
  const pathname = `/${splat}`;

  return (
    <ErrorPage title="Page not found">
      The page "{pathname}" could not be found. Please check the URL or go back
      to the homepage.
    </ErrorPage>
  );
}
