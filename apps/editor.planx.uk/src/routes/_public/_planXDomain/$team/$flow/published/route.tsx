import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  PublicRouteLayout,
  publicRouteSearchSchemas,
} from "utils/routeUtils/publicRouteHelpers";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/published",
)({
  validateSearch: zodValidator(publicRouteSearchSchemas.published),
  pendingComponent: DelayedLoadingIndicator,
  beforeLoad: (args) =>
    createPublicRouteBeforeLoad("published", args.context)(args),
  head: createPublicRouteHead("published"),
  errorComponent: createPublicRouteErrorComponent("published"),
  component: PublishedLayoutComponent,
});

function PublishedLayoutComponent() {
  return (
    <PublicRouteLayout mode="published">
      <Outlet />
    </PublicRouteLayout>
  );
}
