import { createFileRoute } from "@tanstack/react-router";
import GeneralSettings from "pages/FlowEditor/components/Settings/GeneralSettings";

export const Route = createFileRoute("/_authenticated/$team/general-settings")({
  component: GeneralSettings,
});
