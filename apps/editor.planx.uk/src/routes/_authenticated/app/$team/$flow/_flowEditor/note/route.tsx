import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/note",
)({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("NOTES")) {
      throw redirect({ to: "/app/$team/$flow", params });
    }
  },
  component: () => <Outlet />,
});
