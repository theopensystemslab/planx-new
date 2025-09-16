import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_authenticated/admin-panel")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/admin-settings"!</div>;
}
