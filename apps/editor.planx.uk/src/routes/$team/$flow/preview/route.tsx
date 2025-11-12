import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  PublicRouteLayout,
} from "utils/routeUtils/publicRouteHelpers";

export const Route = createFileRoute("/$team/$flow/preview")({
  beforeLoad: createPublicRouteBeforeLoad("preview"),
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
