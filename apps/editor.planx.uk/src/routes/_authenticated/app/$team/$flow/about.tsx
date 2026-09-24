import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import About from "pages/FlowEditor/components/Settings/Flow/About";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/$team/$flow/about")({
  pendingComponent: DelayedLoadingIndicator,
  component: About,
  head: ({ match }) =>
    editorPageTitle("About", match.context.flowName, match.context.team.name),
});
