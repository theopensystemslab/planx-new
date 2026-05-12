import { createFileRoute } from "@tanstack/react-router";
import EmailSettings from "pages/FlowEditor/components/Settings/Flow/Email";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/emails",
)({
  component: EmailSettings,
});
