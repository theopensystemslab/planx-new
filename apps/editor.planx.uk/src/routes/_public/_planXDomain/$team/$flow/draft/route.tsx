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

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/draft")(
  {
    validateSearch: zodValidator(publicRouteSearchSchemas.draft),
    pendingComponent: DelayedLoadingIndicator,
    beforeLoad: createPublicRouteBeforeLoad("draft"),
    head: createPublicRouteHead("draft"),
    errorComponent: createPublicRouteErrorComponent("draft"),
    component: DraftLayoutComponent,
  },
);

function DraftLayoutComponent() {
  return (
    <PublicRouteLayout mode="draft">
      <Outlet />
    </PublicRouteLayout>
  );
}
