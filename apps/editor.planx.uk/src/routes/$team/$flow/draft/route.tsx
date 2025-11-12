import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  PublicRouteLayout,
} from "utils/routeUtils/publicRouteHelpers";

export const Route = createFileRoute("/$team/$flow/draft")({
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
