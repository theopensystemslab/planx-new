import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Explore from "pages/Explore";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/app/$team/explore")({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("EXPLORE")) {
      throw redirect({ to: "/app/$team", params });
    }

    const { canUserEditTeam, getUserRoleForCurrentTeam } = useStore.getState();
    const isAuthorised =
      getUserRoleForCurrentTeam() === "analyst" || canUserEditTeam(params.team);
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: Explore,
});
