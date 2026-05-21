import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Dashboard from "pages/Dashboard";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/$team/")({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("DASHBOARD")) {
      throw redirect({
        to: "/app/$team/flows",
        params: { team: params.team },
      });
    }
  },
  component: Dashboard,
});
