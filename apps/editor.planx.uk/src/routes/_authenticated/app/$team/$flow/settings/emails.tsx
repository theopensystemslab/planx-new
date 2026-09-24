import { createFileRoute } from "@tanstack/react-router";
import EmailSettings from "pages/FlowEditor/components/Settings/Flow/Email";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/emails",
)({
  component: EmailSettings,
  head: ({ match }) =>
    editorPageTitle(
      "Emails",
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});
