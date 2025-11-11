import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/$team/$flow/preview/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$team/$flow/preview/"!</div>;
}
