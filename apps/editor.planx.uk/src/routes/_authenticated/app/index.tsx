import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import Teams from "pages/Teams";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/")({
  loader: () => {
    useStore.getState().clearTeamStore();
  },
  component: AuthenticatedHomeRoute,
  head: () => editorPageTitle("Select a team"),
});

function AuthenticatedHomeRoute() {
  const { teams } = useLoaderData({ from: "/_authenticated/app" });
  return (
    <>
      <Teams teams={teams} />
    </>
  );
}
