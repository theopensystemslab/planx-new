import { createFileRoute } from "@tanstack/react-router";
import IntegrationSettings from "pages/FlowEditor/components/Settings/Team/Integrations";

export const Route = createFileRoute(
  "/_authenticated/$team/settings/integrations",
)({
  component: IntegrationSettings,
});
