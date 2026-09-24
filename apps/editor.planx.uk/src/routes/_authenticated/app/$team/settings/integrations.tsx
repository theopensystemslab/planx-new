import { createFileRoute } from "@tanstack/react-router";
import IntegrationSettings from "pages/FlowEditor/components/Settings/Team/Integrations";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/integrations",
)({
  component: IntegrationSettings,
  head: ({ match }) =>
    editorPageTitle("Integrations", "Team settings", match.context.team.name),
});
