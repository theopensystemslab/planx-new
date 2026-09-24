import { createFileRoute } from "@tanstack/react-router";
import DesignSettings from "pages/FlowEditor/components/Settings/Team/Design";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/design",
)({
  component: DesignSettings,
  head: ({ match }) =>
    editorPageTitle("Design", "Team settings", match.context.team.name),
});
