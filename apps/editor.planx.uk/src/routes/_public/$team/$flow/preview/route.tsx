import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  PublicRouteLayout,
  publicRouteSearchSchemas,
} from "utils/routeUtils/publicRouteHelpers";

export const Route = createFileRoute("/_public/$team/$flow/preview")({
  validateSearch: zodValidator(publicRouteSearchSchemas.preview),
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
