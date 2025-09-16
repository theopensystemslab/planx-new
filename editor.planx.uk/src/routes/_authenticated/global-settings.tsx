import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_authenticated/global-settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/global-settings"!</div>;
}
