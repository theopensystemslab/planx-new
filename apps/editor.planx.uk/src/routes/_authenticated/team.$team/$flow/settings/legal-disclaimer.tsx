import { createFileRoute } from "@tanstack/react-router";
import LegalDisclaimer from "pages/FlowEditor/components/Settings/Flow/LegalDisclaimer";

export const Route = createFileRoute(
  "/_authenticated/team/$team/$flow/settings/legal-disclaimer",
)({
  component: LegalDisclaimer,
});
