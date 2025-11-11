import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/$team/$flow/preview")({
  component: RouteComponent,
});

function RouteComponent() {
  const { team, flow } = Route.useParams();

  return (
    <div>
      <h1>
        Preview Layout for {team}/{flow}
      </h1>
      <p>
        This will eventually contain PublicLayout with preview-specific data
        loading
      </p>
      <Outlet />
    </div>
  );
}
