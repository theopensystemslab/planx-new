import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Explore from "pages/Explore";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/$team/explore")({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("EXPLORE")) {
      throw redirect({ to: "/app/$team", params });
    }

    const isAuthorised = useStore.getState().canUserEditTeam(params.team);
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: Explore,
});
