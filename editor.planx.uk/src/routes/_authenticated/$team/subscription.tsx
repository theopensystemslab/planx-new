import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_authenticated/$team/subscription")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/$team/subscription"!</div>;
}
