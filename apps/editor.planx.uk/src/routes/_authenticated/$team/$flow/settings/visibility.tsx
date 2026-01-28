import { createFileRoute } from "@tanstack/react-router";
import VisibilitySettings from "pages/FlowEditor/components/Settings/Flow/Visibility";

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/settings/visibility",
)({
  component: VisibilitySettings,
});
