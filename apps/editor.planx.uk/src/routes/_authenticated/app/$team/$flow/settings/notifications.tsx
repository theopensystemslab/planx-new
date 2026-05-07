import { createFileRoute } from "@tanstack/react-router";
import EmailTemplateSettings from "pages/FlowEditor/components/Settings/Flow/Notifications";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/notifications",
)({
  component: EmailTemplateSettings,
});
