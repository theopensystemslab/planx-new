import { createFileRoute } from "@tanstack/react-router";
import Help from "pages/FlowEditor/components/Settings/Flow/Help";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/pages/help",
)({
  component: Help,
  head: ({ match }) =>
    editorPageTitle(
      "Help page",
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});
