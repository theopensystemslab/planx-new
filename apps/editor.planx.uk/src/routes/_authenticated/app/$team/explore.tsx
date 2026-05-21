import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Explore from "pages/Explore";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/$team/explore")({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("EXPLORE")) {
      throw redirect({ to: "/app/$team", params: { team: params.team } });
    }
  },
  component: Explore,
});
