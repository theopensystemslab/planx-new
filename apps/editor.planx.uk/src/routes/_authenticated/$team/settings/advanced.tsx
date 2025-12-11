import { createFileRoute } from "@tanstack/react-router";
import AdvancedSettings from "pages/FlowEditor/components/Settings/Team/Advanced";

export const Route = createFileRoute("/_authenticated/$team/settings/advanced")(
  {
    component: AdvancedSettings,
  },
);
