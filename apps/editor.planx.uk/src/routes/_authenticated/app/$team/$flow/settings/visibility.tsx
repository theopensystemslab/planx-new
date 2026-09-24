import { createFileRoute } from "@tanstack/react-router";
import VisibilitySettings from "pages/FlowEditor/components/Settings/Flow/Visibility";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/visibility",
)({
  component: VisibilitySettings,
  head: ({ match }) =>
    editorPageTitle(
      "Visibility",
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});
