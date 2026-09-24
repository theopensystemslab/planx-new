import { createFileRoute } from "@tanstack/react-router";
import About from "pages/FlowEditor/components/Settings/Flow/About";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/about",
)({
  component: About,
  head: ({ match }) =>
    editorPageTitle(
      "About",
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});
