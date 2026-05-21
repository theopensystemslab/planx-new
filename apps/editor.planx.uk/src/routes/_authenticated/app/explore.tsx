import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Explore from "pages/Explore";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/explore")({
  beforeLoad: () => {
    if (!hasFeatureFlag("EXPLORE")) {
      throw redirect({ to: "/app" });
    }
  },
  component: Explore,
});
