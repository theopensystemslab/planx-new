import { createFileRoute } from "@tanstack/react-router";
import GISSettings from "pages/FlowEditor/components/Settings/Team/GIS";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/gis-data",
)({
  component: GISSettings,
  head: ({ match }) =>
    editorPageTitle("GIS data", "Team settings", match.context.team.name),
});
