import { createFileRoute } from "@tanstack/react-router";
import Template from "pages/FlowEditor/components/Settings/Flow/Template";

export const Route = createFileRoute(
  "/_authenticated/team/$team/$flow/settings/templates",
)({
  component: Template,
});
