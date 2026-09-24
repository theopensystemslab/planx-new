import { createFileRoute } from "@tanstack/react-router";
import LegalDisclaimer from "pages/FlowEditor/components/Settings/Flow/LegalDisclaimer";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/legal-disclaimer",
)({
  component: LegalDisclaimer,
  head: ({ match }) =>
    editorPageTitle(
      "Legal disclaimer",
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});
