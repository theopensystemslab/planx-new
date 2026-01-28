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

export const Route = createFileRoute("/_public/$team/$flow/draft")({
  validateSearch: zodValidator(publicRouteSearchSchemas.draft),
  beforeLoad: createPublicRouteBeforeLoad("draft"),
  head: createPublicRouteHead("draft"),
  errorComponent: createPublicRouteErrorComponent("draft"),
  component: DraftLayoutComponent,
});

function DraftLayoutComponent() {
  return (
    <PublicRouteLayout mode="draft">
      <Outlet />
    </PublicRouteLayout>
  );
}
