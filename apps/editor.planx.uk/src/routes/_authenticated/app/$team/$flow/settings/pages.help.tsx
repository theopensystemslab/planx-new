import { createFileRoute } from "@tanstack/react-router";
import Help from "pages/FlowEditor/components/Settings/Flow/Help";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/pages/help",
)({
  component: Help,
});
