import { createFileRoute } from "@tanstack/react-router";
import Privacy from "pages/FlowEditor/components/Settings/Flow/Privacy";

export const Route = createFileRoute(
  "/_authenticated/team/$team/$flow/settings/pages/privacy",
)({
  component: Privacy,
});
