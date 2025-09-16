import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/onboarding"!</div>;
}
