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
  "/_public/_planXDomain/$team/$flow/preview",
)({
  validateSearch: zodValidator(publicRouteSearchSchemas.preview),
  pendingComponent: DelayedLoadingIndicator,
  beforeLoad: (args) =>
    createPublicRouteBeforeLoad("preview", args.context)(args),
  head: createPublicRouteHead("preview"),
  errorComponent: createPublicRouteErrorComponent("preview"),
  component: PreviewLayoutComponent,
});

function PreviewLayoutComponent() {
  return (
    <PublicRouteLayout mode="preview">
      <Outlet />
    </PublicRouteLayout>
  );
}
