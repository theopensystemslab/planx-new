import { createFileRoute } from "@tanstack/react-router";
import AdvancedSettings from "pages/FlowEditor/components/Settings/Team/Advanced";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/advanced",
)({
  component: AdvancedSettings,
  head: ({ match }) =>
    editorPageTitle("Advanced", "Team settings", match.context.team.name),
});
