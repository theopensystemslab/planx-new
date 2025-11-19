import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/$team/$flow/pay/invite/failed")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$team/$flow/pay/invite/failed"!</div>;
}
