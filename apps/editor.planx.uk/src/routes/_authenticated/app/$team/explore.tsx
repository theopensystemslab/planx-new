import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Explore from "pages/Explore";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/app/$team/explore")({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("EXPLORE")) {
      throw redirect({ to: "/app/$team", params });
    }

    const { getUserRoleForCurrentTeam } = useStore.getState();
    const isAuthorised = Boolean(getUserRoleForCurrentTeam());
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: Explore,
});
