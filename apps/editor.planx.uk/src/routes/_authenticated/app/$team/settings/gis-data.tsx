import { createFileRoute } from "@tanstack/react-router";
import GISSettings from "pages/FlowEditor/components/Settings/Team/GIS";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/gis-data",
)({
  component: GISSettings,
});
