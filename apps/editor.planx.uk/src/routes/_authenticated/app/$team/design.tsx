import { createFileRoute } from "@tanstack/react-router";
import DesignSettings from "pages/FlowEditor/components/Settings/Team/Design";

export const Route = createFileRoute("/_authenticated/app/$team/design")({
  component: DesignSettings,
});
