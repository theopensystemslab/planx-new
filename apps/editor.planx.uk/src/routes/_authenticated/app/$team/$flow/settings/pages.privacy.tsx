import { createFileRoute } from "@tanstack/react-router";
import Privacy from "pages/FlowEditor/components/Settings/Flow/Privacy";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/pages/privacy",
)({
  component: Privacy,
  head: ({ match }) =>
    editorPageTitle(
      "Privacy page",
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});
