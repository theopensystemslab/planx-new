import { createFileRoute, notFound } from "@tanstack/react-router";
import Explore from "pages/Explore";
import { useStore } from "pages/FlowEditor/lib/store";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/$team/explore")({
  beforeLoad: () => {
    const { getUserRoleForCurrentTeam } = useStore.getState();
    const isAuthorised = Boolean(getUserRoleForCurrentTeam());
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: Explore,
  head: ({ match }) => editorPageTitle("Explore", match.context.team.name),
});
