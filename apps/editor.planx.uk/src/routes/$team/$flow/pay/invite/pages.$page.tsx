import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/$team/$flow/pay/invite/pages/$page")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$team/$flow/pay/invite/pages/$page"!</div>;
}
