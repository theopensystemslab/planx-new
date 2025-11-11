import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/$team/$flow/preview/pages/$page")({
  component: RouteComponent,
});

function RouteComponent() {
  const { page } = Route.useParams();
  return <div>Hello "/$team/$flow/preview/pages/{page}"!</div>;
}
