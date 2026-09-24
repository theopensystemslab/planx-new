import { createFileRoute } from "@tanstack/react-router";
import Template from "pages/FlowEditor/components/Settings/Flow/Template";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/templates",
)({
  component: Template,
  head: ({ match }) =>
    editorPageTitle(
      "Templates",
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});
