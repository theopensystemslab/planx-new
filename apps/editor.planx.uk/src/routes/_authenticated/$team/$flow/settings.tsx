import { createFileRoute } from "@tanstack/react-router";
import ServiceSettings from "pages/FlowEditor/components/Settings/ServiceSettings/ServiceSettings";

export const Route = createFileRoute("/_authenticated/$team/$flow/settings")({
  component: ServiceSettings,
});
