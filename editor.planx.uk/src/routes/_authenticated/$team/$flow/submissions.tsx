import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_authenticated/$team/$flow/submissions")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  return <div>Hello "/_authenticated/$team/$flow/submissions"!</div>;
}
