import { createFileRoute, notFound } from "@tanstack/react-router";
import { TeamMembers } from "pages/FlowEditor/components/Team/TeamMembers";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/app/$team/members")({
  loader: async ({ params }) => {
    const isAuthorised = useStore.getState().canUserEditTeam(params.team);
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: TeamMembers,
});
