import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Dashboard from "pages/Dashboard";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/$team/dashboard")({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("DASHBOARD")) {
      throw redirect({ to: "/app/$team", params: { team: params.team } });
    }
  },
  component: Dashboard,
});
