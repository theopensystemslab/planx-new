import { createFileRoute } from "@tanstack/react-router";
import DesignSettings from "pages/FlowEditor/components/Settings/Team/Design";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/$team/design")({
  component: DesignSettings,
  head: ({ match }) => editorPageTitle("Design", match.context.team.name),
});
