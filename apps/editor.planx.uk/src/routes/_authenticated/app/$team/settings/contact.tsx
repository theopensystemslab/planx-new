import { createFileRoute } from "@tanstack/react-router";
import ContactSettings from "pages/FlowEditor/components/Settings/Team/Contact";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/contact",
)({
  component: ContactSettings,
});
