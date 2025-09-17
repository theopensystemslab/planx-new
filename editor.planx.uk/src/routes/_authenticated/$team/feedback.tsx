import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_authenticated/$team/feedback")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/$team/feedback"!</div>;
}
