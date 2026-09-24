import { createFileRoute } from "@tanstack/react-router";
import ContactSettings from "pages/FlowEditor/components/Settings/Team/Contact";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/contact",
)({
  component: ContactSettings,
  head: ({ match }) =>
    editorPageTitle(
      "Contact information",
      "Team settings",
      match.context.team.name,
    ),
});
