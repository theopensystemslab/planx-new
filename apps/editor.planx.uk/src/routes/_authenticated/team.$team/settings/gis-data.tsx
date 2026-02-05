import { createFileRoute } from "@tanstack/react-router";
import GISSettings from "pages/FlowEditor/components/Settings/Team/GIS";

export const Route = createFileRoute(
  "/_authenticated/team/$team/settings/gis-data",
)({
  component: GISSettings,
});
