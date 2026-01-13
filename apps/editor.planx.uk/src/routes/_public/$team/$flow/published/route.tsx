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

export const Route = createFileRoute("/_public/$team/$flow/published")({
  validateSearch: zodValidator(publicRouteSearchSchemas.published),
  beforeLoad: createPublicRouteBeforeLoad("published"),
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
