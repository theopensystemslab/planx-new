import ErrorPage from "pages/ErrorPage/ErrorPage";
import React from "react";

export function CatchAllComponent() {
  return (
    <ErrorPage title="Page not found">
      The page you're looking for doesn't exist. Please check the URL or go back
      to the homepage.
    </ErrorPage>
  );
}
