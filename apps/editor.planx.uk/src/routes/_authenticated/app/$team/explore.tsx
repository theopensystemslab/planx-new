import { createFileRoute, notFound } from "@tanstack/react-router";
import Explore from "pages/Explore";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/app/$team/explore")({
  beforeLoad: () => {
    const { getUserRoleForCurrentTeam } = useStore.getState();
    const isAuthorised = Boolean(getUserRoleForCurrentTeam());
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: Explore,
});
