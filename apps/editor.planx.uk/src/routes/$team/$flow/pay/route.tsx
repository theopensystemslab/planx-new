import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  PublicRouteLayout,
} from "utils/routeUtils/publicRouteHelpers";

export const Route = createFileRoute("/$team/$flow/pay")({
  beforeLoad: createPublicRouteBeforeLoad("pay"),
  errorComponent: createPublicRouteErrorComponent("pay"),
  component: PayLayoutComponent,
});

function PayLayoutComponent() {
  return (
    <PublicRouteLayout mode="pay">
      <Outlet />
    </PublicRouteLayout>
  );
}
