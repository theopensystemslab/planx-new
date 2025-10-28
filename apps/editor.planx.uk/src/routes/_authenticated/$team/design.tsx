import { createFileRoute } from "@tanstack/react-router";
import DesignSettings from "pages/FlowEditor/components/Settings/DesignSettings";

export const Route = createFileRoute("/_authenticated/$team/design")({
  component: DesignSettings,
});
